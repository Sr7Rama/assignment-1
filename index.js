const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Exponential Backoff Helper with Full Jitter
async function retryWithBackoff(operation, maxRetries = 5, baseDelay = 500) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      attempts++;
      return await operation(attempts);
    } catch (error) {
      if (attempts >= maxRetries) {
        throw new Error(`Max retries reached (${maxRetries}). Final Error: ${error.message}`);
      }
      // Exponential backoff: baseDelay * 2^(attempt-1) + Jitter
      const temp = baseDelay * Math.pow(2, attempts - 1);
      const delay = Math.floor(Math.random() * temp); // Full Jitter
      
      console.log(`[RETRY] Attempt ${attempts} failed. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Simulated flaky external endpoint
function flakyService(attempt) {
  return new Promise((resolve, reject) => {
    const success = Math.random() > 0.6; // 40% success rate
    if (success) {
      resolve({ status: 200, message: `Success on attempt ${attempt}` });
    } else {
      reject(new Error(`Service unavailable on attempt ${attempt}`));
    }
  });
}

// API Route triggering the backoff algorithm
app.get('/api/run-task', async (req, res) => {
  try {
    const result = await retryWithBackoff(flakyService);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Assignment 1 Prototype: Return/Backoff API is Live.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
