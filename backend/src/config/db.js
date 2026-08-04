const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/kartify';

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[db] Connection error: ${err.message}`);
    // Retry after a delay instead of crashing immediately — useful in k8s
    // where mongo pod may still be starting up.
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[db] MongoDB disconnected, attempting to reconnect...');
});

module.exports = connectDB;
