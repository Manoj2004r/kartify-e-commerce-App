require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { seedIfEmpty } = require('./seed/seed');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  // Auto-seed on startup, but only when explicitly enabled. This is safe
  // to leave on permanently for a demo/portfolio deployment, since
  // seedIfEmpty() checks for existing data first and never overwrites
  // anything. Leave it unset (or "false") for any environment holding
  // real data you care about, as an extra safety margin beyond the
  // empty-check itself.
  if (process.env.AUTO_SEED === 'true') {
    try {
      await seedIfEmpty();
    } catch (err) {
      // Don't let a seeding failure prevent the server from starting —
      // log it and continue serving whatever data does exist.
      console.error('[server] Auto-seed failed:', err.message);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`[server] Kartify API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

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
}

start().catch((err) => {
  // connectDB() now throws if it can never establish a connection —
  // exit clearly so Docker/ECS's restart policy kicks in, rather than
  // limping along with a broken database layer.
  console.error('[server] Fatal startup error:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection:', reason);
});
