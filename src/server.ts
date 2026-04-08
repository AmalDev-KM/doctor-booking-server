import 'dotenv/config';
import app from './app';
import connectDB from './config/database';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;

/**
 * Bootstrap the server:
 * 1. Connect to MongoDB
 * 2. Start Express HTTP server
 * 3. Handle unhandled rejections and uncaught exceptions
 */
const startServer = async (): Promise<void> => {
  // Connect to MongoDB before starting the server
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
    logger.info(`📋 API Health: http://localhost:${PORT}/api/health`);
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: Error) => {
    logger.error(`Unhandled Rejection: ${reason.message}`);
    logger.error('Shutting down server due to unhandled promise rejection...');
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle uncaught exceptions (sync errors outside Express)
  process.on('uncaughtException', (error: Error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    logger.error('Shutting down server due to uncaught exception...');
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle SIGTERM for graceful shutdown (e.g., Docker, PM2)
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Process terminated.');
      process.exit(0);
    });
  });
};

startServer();
