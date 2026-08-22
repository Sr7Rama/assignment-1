# Assignment 1: Learning & Blocker Journal

## Resources Consulted

1. **AWS Architecture Blog**: *Exponential Backoff and Jitter* - Understood why adding randomization prevents "thundering herd" issues.
2. **MDN Web Docs**: *Promises and async/await* - Handled delay pauses efficiently using `setTimeout` inside Promises.
3. **Render Docs**: *Deploy a Node.js Express App* - Configured dynamic port handling with `process.env.PORT`.

## Blocker & Error Log

### Blocker 1: Port Binding Error on Render Deployment

**Error Log:**

```text
Error: listen EADDRINUSE: address already in use :::3000
```

**Root Cause:** Hardcoded port `3000` instead of reading environment variables supplied by the host.

**Resolution:** Changed port initialization to:

```js
const PORT = process.env.PORT || 3000;
```

### Blocker 2: Unhandled Rejection Crash During Retries

**Error Log:**

```text
UnhandledPromiseRejectionWarning: Unhandled promise rejection.
```

**Root Cause:** The `flakyService` promise failure was not wrapped properly in the retry loop block.

**Resolution:** Wrapped execution inside an `async`/`try-catch` block inside `retryWithBackoff`.

### Blocker 4: Flaky Stock Queries Causing False "Out of Stock" Responses

**Error Log:**

```text
Error: Database timeout during stock check
```

**Root Cause:** Network drops or transient database lag caused stock queries to fail, leading support tools to incorrectly report items as out of stock.

**Resolution:** Wrapped live stock checks in `retryWithBackoff`. If a database attempt times out, the service retries up to 4 times before returning a `503` failure status, ensuring completed answers represent accurate real-time inventory.

### Blocker 5: Cannot GET / Error on Root Deployment

**Error Log:** `Cannot GET /` (404 status on root URL)

**Root Cause:** The base `app.get('/', ...)` route was overwritten when the `/api/inventory/:sku` endpoint was introduced.

**Resolution:** Re-added the root `GET` handler in `index.js` to serve a health-check message, returning `200 OK` for requests to the base URL.

## Key Takeaways & Learnings

- Adding jitter (randomization) to exponential backoff prevents synchronized retry bursts.
- Environment variables are critical for cross-environment deployments, such as local development and Render.
