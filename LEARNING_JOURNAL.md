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

## Key Takeaways & Learnings

- Adding jitter (randomization) to exponential backoff prevents synchronized retry bursts.
- Environment variables are critical for cross-environment deployments, such as local development and Render.
