import { API } from '#/lib/api';
import logger from '#/lib/logger';
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // if (process.env.NODE_ENV === 'development') {
  logger.error(err);
  // }

  API.errorWithStatus(res, statusCode, message);
};
