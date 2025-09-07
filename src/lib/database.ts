import { PrismaClient } from '@prisma/client';
import logger from './logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Simple configuration that works with Prisma v6
export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    // Use simple string array for log levels instead of objects
    log:
      process.env.NODE_ENV === 'development'
        ? ['info', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Test database connection
const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Test query to ensure connection works
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database query test successful');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

// Graceful shutdown
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
};

// Handle process termination
process.on('beforeExit', disconnectDB);
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, disconnecting from database...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, disconnecting from database...');
  await disconnectDB();
  process.exit(0);
});

export { connectDB, disconnectDB };
export default prisma;
