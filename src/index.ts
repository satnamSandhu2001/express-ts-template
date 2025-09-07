import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import logger from '#/lib/logger';
import { errorHandler } from '#/middleware/error.middleware';
import { notFoundHandler } from '#/middleware/notFound.middleware';
import prisma, { connectDB } from './lib/database';
import initializeRouter from './router';
import cookieParser from 'cookie-parser';

if (!process.env.IS_DOCKER) {
  require('dotenv').config({
    path: '.env',
    // quiet: true,
  });
}

class Server {
  public app: Application;
  private readonly port: number;

  constructor() {
    logger.info('Initializing server...');
    this.app = express();
    this.port = parseInt(process.env.PORT || '5500', 10);

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(
      helmet({
        crossOriginResourcePolicy: {
          policy: 'cross-origin',
        },
      })
    );

    this.app.use(
      cors({
        origin: process.env.CORS_ORIGINS?.split(',') || '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      })
    );
    this.app.use(cookieParser());
    this.app.use(compression());

    this.app.use(
      morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')
    );

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private initializeRoutes(): void {
    this.app.use('/api/v1', initializeRouter);
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await connectDB();
      this.app.listen(this.port, '0.0.0.0', () => {
        logger.info(`🚀 Server running on port ${this.port}`);
        logger.info(` Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(
          ` CORS allowed: ${process.env.CORS_ORIGINS?.split(',') || '*'}`
        );
        logger.info(` Health check: http://localhost:${this.port}/api/v1/ping`);
      });
    } catch (error) {
      logger.error('Failed to start server: ', error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});
