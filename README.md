# cacheable-crawlee

[![npm version](https://badge.fury.io/js/cacheable-crawlee.svg)](https://npmjs.com/package/cacheable-crawlee)

## Why

Using crawlee's default crawling flow, which only saves whether a task is complete and the processed data, comes with some pain points:

1. If you need more details from a response, you have to re-crawl the same task even if the content hasn’t changed.
2. When you add new tasks based on the responses of other tasks, you also have to re-crawl those for the same reason.

HTTP requests are the most expensive part of web crawling, while other processes are usually inexpensive.

Instead of completely skipping a task after it's done, we can cache the response. When re-running the crawler, we will process all tasks but only send requests for those that aren't cached.

For more discussion, see [Why cacheable-crawlee?](https://tldr.ws/why-cacheable-crawlee)

## What

`cacheable-crawlee` is a Node.js package that provides caching capabilities for the [crawlee](https://crawlee.dev/)'s `HttpCrawler` based crawlers. It allows you to cache HTTP responses to improve the efficiency and speed of your web crawling tasks.

The cache policy follows [RFC 7234](https://tools.ietf.org/html/rfc7234) and [RFC 5861](https://tools.ietf.org/html/rfc5861) standards, and is implemented by [http-cache-semantics](https://www.npmjs.com/package/http-cache-semantics).

## Usage

### Installation

Simply install the package using npm/yarn/pnpm:

```sh
npm install cacheable-crawlee
```

### Basic Usage

To use `cacheable-crawlee`, you need to "install" it into your `HttpCrawler` instance. Here's an example:

```typescript
import { HttpCrawler } from 'crawlee';
import { CacheableCrawlee } from 'cacheable-crawlee';

// Your crawler. Can be HttpCrawler, CheerioCrawler or any other HttpCrawler based crawler
const crawler = new HttpCrawler({
  // ...
});

// Add this line to enable caching
CacheableCrawlee({/* CacheableOptions */}).install(crawler);

await crawler.run([
  // ...
]);
```

Responses will be cached into a `KeyValueStore` named `http-cahce` by default.

## Configuration

Pass options shaped as `CacheableOptions` to the `CacheableCrawlee` constructor to configure the default caching behavior.

### Cache Policy Related Options

- `cacheControl`: The cache control header to use. Default is `max-stale=3600`. This option greatly influences the caching strategy.
- `publicOnly`: By default, `cacheable-crawlee` also caches responses with `Cache-Control: private`. Set this option to `true` to only cache public responses.
- `cacheHeuristic`/`immutableMinTimeToLive`/`ignoreCargoCult`:  These options are passed to the `http-cache-semantics` library. Refer to the [documentation](https://www.npmjs.com/package/http-cache-semantics) for more information.
 
### Storage Related Options

- `storeName`: The name of crawlee's `KeyValueStore` to use. Default is `http-cache`.
- `cache`: If you want to use a custom cache store instead of the `KeyValueStore`, you can provide a store adapter instance of [keyv](https://www.npmjs.com/package/keyv) here.

## Advanced Usage


### Cache as much as possible

To cache as much as possible, you can use the following options:

```typescript
CacheableCrawlee({ cacheControl: 'max-stale' }).install(crawler);
```

### Request specific cache control

You can also override the default cache options on a per-request basis:

```typescript
import { makeCacheable } from 'cacheable-crawlee';
import { Request } from 'crawlee';

const task1 = new Request({ url: 'https://example.com/foo' });
const task2 = new Request({ url: 'https://example.com/bar' });
makeCacheable(task1, { cacheControl: 'no-store' }); // disable caching for task1
makeCacheable(task2, { storeName: 'hello' }); // use a different store for task2

await crawler.run([task1, task2]); 
```

### Use redis as cache store

You can use `redis` as the cache store by providing a `@keyv/redis` instance:

```typescript
import KeyvRedis from '@keyv/redis';
import { CacheableCrawlee } from 'cacheable-crawlee';

const redis = new KeyvRedis('127.0.0.1:6379');

CacheableCrawlee({ cache: redis }).install(crawler);
```

## License

[MIT ©️ xc2](https://tldr.ws/mitxc2)