'use strict';

const app = require('./app');
const config = require('./config');

if (config.storage.driver === 'file' && config.isVercel) {
  console.warn('[warn] STORAGE_DRIVER=file on Vercel is NOT persistent. Use STORAGE_DRIVER=supabase.');
}

const server = app.listen(config.port, () => {
  console.log(`LearnSprint.ink running at http://localhost:${config.port}  (storage: ${config.storage.driver})`);
});

const shutdown = (signal) => {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
