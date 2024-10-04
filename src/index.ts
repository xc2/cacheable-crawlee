import { HttpCrawler, HttpCrawlerOptions } from "@crawlee/http";
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

export function CacheableCrawlee(defaultOptions: CacheableOptions = {}): Pick<
  HttpCrawlerOptions,
  "preNavigationHooks" | "postNavigationHooks"
> & {
  install: <C extends HttpCrawler<any>>(crawler: C) => void;
} {
  const config = {
    preNavigationHooks: [
      async ({ crawler, request, getKeyValueStore }, gotOptions) => {
        const options: CacheableOptions = {
          ...defaultOptions,
          ...request.userData[CacheableField],
        };
        options.storeName = options.storeName || "http-cache";
        options.cacheControl = options.cacheControl ?? "max-age=3600";
        options.cache =
          options.cache ||
          new KeyvKeyValueStore({
            getKeyValueStore: getKeyValueStore.bind(null, options.storeName),
          });
        gotOptions.cache = options.cache;
        request.headers = {
          "cache-control": options.cacheControl,
          ...request.headers,
        };
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
