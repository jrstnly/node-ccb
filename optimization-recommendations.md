# CCB API Client Optimization Recommendations

Status as of 0.14.0. Items are kept in their original order; each notes whether it has been addressed.

## 1. HTTP Client Caching and Reuse
- **Done.** `got` is loaded once and reused by `Data`. It is still loaded with a dynamic `import()` because `got` is ESM-only and the library also ships a CommonJS build.

## 2. Error Handling Improvements
- **Done.** All HTTP methods go through `Data.request`, which builds one consistent `CCBError` (`status`, `body`, `retryAfter`). Token failures throw `CCBAuthError`.
- **Open.** The convenience classes in `src/lib` still reject with the older `{ type: 'error', data }` envelope rather than a `CCBError`.

## 3. Type Safety Enhancements
- **Done for the full API.** Everything under `ccb.api` is generated from the OpenAPI specification with typed parameters, bodies and responses.
- **Open.** The convenience classes in `src/lib` still use `any` for parameters and results, and `search(type, config)` takes an untyped config. The `got` client is typed as `any` because the installed `@types/got` is for a much older major version; removing that package would let `got`'s own types be used.

## 4. Promise Handling
- **Done.** `connect` is a plain `async` method with a single outcome per path.
- **Open.** Several methods in `src/lib` still wrap `async` code in `new Promise(...)`, and some call `reject` without returning, so execution continues after a validation failure.

## 5. Memory Management
- **Done.** The `BehaviorSubject` subscriptions are gone; auth state lives in the `Auth` class.
- **Open.** `rxjs` is still imported (unused) by the files in `src/lib` and could be dropped as a dependency. `uuid` is no longer used at all.

## 6. Code Duplication
- **Done.** `get`, `post`, `put` and `delete` share `Data.request`, and URL and query building is in one place.

## 7. Configuration Management
- **Open.** Config validation is still inline in `connect`.

## 8. Performance Optimizations
- **Done.** Token refreshes are single-flighted, so concurrent calls share one token request.
- **Open.** There is no client-side throttling. Rate-limited requests are retried after `retry-after`, but bulk jobs can still hit the limit of 1 request per second per endpoint. A per-endpoint limiter would avoid the 429s entirely.

## 9. Security Improvements
- **Open.** Tokens and the client secret are handed to the caller's `dataSetter` as plain values; storing them safely is the caller's responsibility.
- **Open.** Input validation exists only on a few convenience methods.

## 10. Code Organization
- **Done.** Authentication (`src/auth.ts`), transport (`src/data.ts`), errors (`src/errors.ts`) and generated endpoints (`src/generated`) are separate.

## 11. Documentation
- **Done.** Generated methods carry JSDoc with the endpoint, required scope and parameter descriptions. The README covers authentication, pagination, rate limits, errors and testing, and `docs/endpoints.md` lists every endpoint.
- **Open.** The convenience classes in `src/lib` have no JSDoc.

## 12. Testing Considerations
- **Done.** `npm test` runs the client against a local stand-in for the API, and `npm run test:live` is a read-only smoke test against the real API.
- **Open.** No write endpoint (create, update, delete, upload) has been exercised against the live API, and the `authorization_code` grant is covered by mock tests only.
