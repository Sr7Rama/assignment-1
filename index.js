const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. Root Route (Health Check)
app.get('/', (req, res) => {
  res.send('Assignment 1 Prototype: Return/Backoff & Inventory API is Live.');
});

// Mock In-Memory Inventory Database
const inventoryDB = {
  'SKU-101': { name: 'Wireless Mouse', stock: 15 },
  'SKU-102': { name: 'Mechanical Keyboard', stock: 0 },
  'SKU-103': { name: '27-inch Monitor', stock: 8 }
};

// Exponential Backoff with Jitter
async function retryWithBackoff(operation, maxRetries = 4, baseDelay = 300) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      attempts++;
      return await operation(attempts);
    } catch (error) {
      if (attempts >= maxRetries) {
        throw new Error(`Operation failed after ${maxRetries} attempts. Cause: ${error.message}`);
      }
      const temp = baseDelay * Math.pow(2, attempts - 1);
      const delay = Math.floor(Math.random() * temp);
      console.log(`[RETRY] Attempt ${attempts} failed. Retrying in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

// Simulated Flaky Inventory Database Call
function queryStockDatabase(sku, attempt) {
  return new Promise((resolve, reject) => {
    // 30% chance of temporary database timeout/failure
    const isNetworkFlaky = Math.random() < 0.3;

    if (isNetworkFlaky) {
      reject(new Error(`Database timeout on attempt ${attempt}`));
    } else {
      const item = inventoryDB[sku];
      if (!item) {
        resolve({ found: false, sku });
      } else {
        resolve({
          found: true,
          sku,
          name: item.name,
          stock: item.stock,
          inStock: item.stock > 0
        });
      }
    }
  });
}

// Live Inventory API Route with Backoff Safeguard
app.get('/api/inventory/:sku', async (req, res) => {
  const { sku } = req.params;

  try {
    const stockData = await retryWithBackoff((attempt) => queryStockDatabase(sku, attempt));

    if (!stockData.found) {
      return res.status(404).json({ success: false, message: `SKU ${sku} not found.` });
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: stockData
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      error: 'Inventory query failed.',
      details: err.message
    });
  }
});

// 3. Flaky Task Retry Route
app.get('/api/run-task', async (req, res) => {
  try {
    const result = await retryWithBackoff((attempt) => {
      return new Promise((resolve, reject) => {
        if (Math.random() > 0.6) {
          resolve({ status: 200, message: `Success on attempt ${attempt}` });
        } else {
          reject(new Error(`Service unavailable on attempt ${attempt}`));
        }
      });
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
