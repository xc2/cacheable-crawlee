import { HttpCrawlerOptions, HttpCrawlingContext, InternalHttpHook } from "@crawlee/http";
import { getDomain } from "tldts";
import { KeyvKeyValueStore } from "./keyv-kvstore";

export { KeyvKeyValueStore };

export function getCacheableCrawleeConfig({
  defaultCacheControl,
}: { defaultCacheControl?: string }) {
  defaultCacheControl = defaultCacheControl || "max-age=3600";
  return {
    preNavigationHooks: [
      async ({ crawler, request, getKeyValueStore }, gotOptions) => {
        gotOptions.cache = new KeyvKeyValueStore({
          getKeyValueStore: () => getKeyValueStore("http-cache"),
        });
        request.headers = {
          "cache-control": defaultCacheControl,
          ...request.headers,
        };
        const domain = getDomain(request.url);
        request._accessedTime = {
          domain,
          time: crawler.domainAccessedTime.get(domain),
        };
      },
    ],
    postNavigationHooks: [
      async ({ crawler, response, request, getKeyValueStore }) => {
        const fromCache =
          response.isFromCache || response.response?.isFromCache || response.response?.fromCache;
        if (
          fromCache &&
          crawler.domainAccessedTime.get(request._accessedTime.domain) ===
            request._accessedTime.time
        ) {
          crawler.domainAccessedTime.delete(request._accessedTime.domain);
        }
      },
    ],
  } satisfies Pick<HttpCrawlerOptions, "preNavigationHooks" | "postNavigationHooks">;
}
