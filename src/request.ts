import { Request } from "@crawlee/http";
import { KeyvStoreAdapter } from "keyv";
export interface CacheableOptions {
  /**
   * The name of crawlee's KeyValueStore to use, `http-cache` by default.
   */
  storeName?: string;
  /**
   * The cache store to use. By default, it uses crawlee's KeyValueStore.
   * Any [keyv](https://github.com/jaredwray/keyv)'s adapter can be used.
   */
  cache?: KeyvStoreAdapter;
  /**
   * The cache control header to use, `max-stale=3600` by default.
   * See [MDN](https://mdn.io/Cache-Control) for more information.
   */
  cacheControl?: string;
  /**
   * By default, cacheable-crawlee also caches private responses.
   * Set this to `true` to only cache public responses.
   */
  publicOnly?: boolean;
  /**
   * a fraction of response's age that is used as a fallback cache duration.
   * see [Package http-cache-semantics](https://www.npmjs.com/package/http-cache-semantics) for more information.
   */
  cacheHeuristic?: number;
  /**
   * a number of milliseconds to assume as the default time to cache responses with `Cache-Control: immutable`
   * see [Package http-cache-semantics](https://www.npmjs.com/package/http-cache-semantics) for more information.
   */
  immutableMinTimeToLive?: number;
  /**
   * if common anti-cache directives will be completely ignored if the non-standard pre-check and post-check directives are present
   * see [Package http-cache-semantics](https://www.npmjs.com/package/http-cache-semantics) for more information.
   */
  ignoreCargoCult?: boolean;
}

export const CacheableField = "$$Cacheable$$";
export function makeCacheable<T extends Request<any>>(
  request: T,
  options: CacheableOptions
): Request<
  T & {
    [CacheableField]: CacheableOptions;
  }
> {
  Object.defineProperty(request.userData, CacheableField, {
    value: { ...options },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  return request as any;
}
