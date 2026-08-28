require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`[server] Kartify API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

// Graceful shutdown — important in Kubernetes so pods drain in-flight
// requests before terminating on SIGTERM (pod eviction/rollout).
const shutdown = (signal) => {
  console.log(`[server] ${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log('[server] HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection:', reason);
});
