import type { HttpCrawlerOptions, InternalHttpCrawlingContext } from "@crawlee/http";
import { getDomain } from "tldts";
import { KeyvKeyValueStore } from "./keyv-kvstore.js";
import { CacheableField, CacheableOptions } from "./request.js";

const accessedState = Symbol.for("Accessed State");
interface AccessedState {
  domain: string;
  time: number;
}
export { KeyvKeyValueStore, CacheableField };
export type { CacheableOptions };
export { makeCacheable } from "./request.js";

export function CacheableCrawlee<
  Context extends InternalHttpCrawlingContext = InternalHttpCrawlingContext,
>(
  defaultOptions: CacheableOptions = {}
): Pick<HttpCrawlerOptions<Context>, "preNavigationHooks" | "postNavigationHooks"> & {
  install: (httpCrawlerBasedCrawler: unknown) => void;
} {
  const config = {
    preNavigationHooks: [
      async ({ crawler, request, getKeyValueStore }, gotOptions) => {
        const options: CacheableOptions = {
          cacheControl: "max-stale=3600",
          ...defaultOptions,
          ...request.userData[CacheableField],
        };
        options.storeName = options.storeName || "http-cache";
        options.cache =
          options.cache ||
          new KeyvKeyValueStore({
            getKeyValueStore: getKeyValueStore.bind(null, options.storeName),
          });
        const { publicOnly, cacheHeuristic, immutableMinTimeToLive, ignoreCargoCult } = options;
        gotOptions.cache = options.cache;
        gotOptions.cacheOptions = {
          shared: Boolean(publicOnly),
          cacheHeuristic,
          immutableMinTimeToLive,
          ignoreCargoCult,
        };
        if (options.cacheControl && !request.headers?.["cache-control"]) {
          request.headers = {
            "cache-control": options.cacheControl,
            ...request.headers,
          };
        }
        const domain = getDomain(request.url) ?? "";
        const domainAccessedTime = (crawler as any).domainAccessedTime as Map<string, number>;
        Object.defineProperty(request, accessedState, {
          value: { domain, time: domainAccessedTime.get(domain) },
          configurable: true,
          writable: true,
        });
      },
    ],
    postNavigationHooks: [
      async ({ crawler, response, request }) => {
        const fromCache =
          response.isFromCache ||
          (response as any).response?.isFromCache ||
          (response as any).response?.fromCache;
        const state = (request as any)[accessedState] as AccessedState;
        const domainAccessedTime = (crawler as any).domainAccessedTime as Map<string, number>;
        if (fromCache && domainAccessedTime.get(state?.domain) === state?.time) {
          domainAccessedTime.delete(state?.domain);
        }
      },
    ],
  } satisfies Pick<HttpCrawlerOptions, "preNavigationHooks" | "postNavigationHooks">;
  return {
    ...config,
    install(crawler) {
      (crawler as any).preNavigationHooks.push(...config.preNavigationHooks);
      (crawler as any).postNavigationHooks.push(...config.postNavigationHooks);
    },
  };
}
