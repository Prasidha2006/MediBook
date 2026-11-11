import app from './app.js';
import { config } from './config/index.js';
import { initDatabase } from './config/db.js';

async function bootstrap() {
  await initDatabase();

  const server = app.listen(config.port, () => {
    console.log(`
  ======================================================
  🏥  MediBook Backend API Server is Live!
  📡  Listening on: http://localhost:${config.port}
  🌐  Base API URL: http://localhost:${config.port}/api/v1
  🔒  Environment:  ${config.env}
  ======================================================
    `);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\nShutting down MediBook server gracefully...');
    server.close(() => {
      console.log('Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
