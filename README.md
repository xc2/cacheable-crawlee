# cacheable-crawlee


`cacheable-crawlee` is a Node.js package that provides caching capabilities for the [crawlee](https://crawlee.dev/)'s `HttpCrawler` based crawlers.

It allows you to cache HTTP responses to improve the efficiency and speed of your web crawling tasks.

The cache policy follows [RFC 7234](https://tools.ietf.org/html/rfc7234) and [RFC 5861](https://tools.ietf.org/html/rfc5861) standards, and is implemented by [http-cache-semantics](https://www.npmjs.com/package/http-cache-semantics).

## Installation

Simply install the package using npm/yarn/pnpm:

```sh
npm install cacheable-crawlee
```

## Usage

### Basic Setup

To use `cacheable-crawlee`, you need to configure your crawler with pre-navigation and post-navigation hooks that handle caching.

```typescript
import { HttpCrawler } from 'crawlee';
import { CacheableCrawlee } from 'cacheable-crawlee';

const crawler = new HttpCrawler({
  // ...
});

// Add this line to enable caching
CacheableCrawlee({
  // CacheableOptions
}).install(crawler);

await crawler.run([
  // ...
]);
```

## `CacheableOptions`

The `CacheableOptions` interface provides several configuration options:

- `storeName`: The name of Crawlee's KeyValueStore to use. Default is `http-cache`.
- `cache`: The cache store to use. Any Keyv adapter can be used.
- `cacheControl`: The cache control header to use. Default is `max-age=3600`.
- `publicOnly`: Set to `true` to only cache public responses.
- `cacheHeuristic`: A fraction of the response's age used as a fallback cache duration.
- `immutableMinTimeToLive`: Default time to cache responses with `Cache-Control: immutable`.
- `ignoreCargoCult`: If common anti-cache directives will be ignored if non-standard pre-check and post-check directives are present.
