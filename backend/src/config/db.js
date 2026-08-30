const mongoose = require('mongoose');

/**
 * Connects to MongoDB, retrying on failure, and does NOT resolve until a
 * connection is actually established (or retries are exhausted). This
 * matters specifically because server.js awaits this before running the
 * auto-seed check — the previous version returned after a single failed
 * attempt even though a background retry was still pending, letting
 * server.js proceed as if a connection existed when it didn't.
 */
const connectDB = async (maxRetries = 10, retryDelayMs = 5000) => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/kartify';
  mongoose.set('strictQuery', true);

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`[db] MongoDB connected: ${conn.connection.host}`);
      return; // success — stop retrying
    } catch (err) {
      console.error(`[db] Connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt === maxRetries) {
        throw new Error(`[db] Could not connect to MongoDB after ${maxRetries} attempts`);
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[db] MongoDB disconnected');
});

module.exports = connectDB;
