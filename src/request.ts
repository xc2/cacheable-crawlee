import { Request } from "@crawlee/http";
import { KeyvStoreAdapter } from "keyv";
export interface CacheableOptions {
  storeName?: string;
  cache?: KeyvStoreAdapter;
  cacheControl?: string;
  publicOnly?: boolean;
  cacheHeuristic?: number;
  immutableMinTimeToLive?: number;
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
