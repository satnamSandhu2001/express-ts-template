import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: {
    [key: string]: string;
  };
}

const successStatusCode = 200;
const errorStatusCode = 400;
const validationErrorStatusCode = 422;
const notFoundStatusCode = 404;
const unauthorizedStatusCode = 401;
const internalServerErrorStatusCode = 500;

function success(res: Response, message: string, data?: unknown) {
  return res.status(successStatusCode).json({
    success: true,
    message,
    data,
  });
}
function errorWithStatus(res: Response, statusCode: number, message: string) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

function error(res: Response, message: string) {
  return res.status(errorStatusCode).json({
    success: false,
    message,
  });
}

function validationError(res: Response, message: string, errors?: unknown) {
  return res.status(validationErrorStatusCode).json({
    success: false,
    message,
    errors,
  });
}

function notFound(res: Response, message?: string) {
  return res.status(notFoundStatusCode).json({
    success: false,
    message: message || 'Not Found',
  });
}

function unauthorized(res: Response, message?: string) {
  return res.status(unauthorizedStatusCode).json({
    success: false,
    message: message || 'Unauthorized',
  });
}

function internalServerError(res: Response, message?: string) {
  return res.status(internalServerErrorStatusCode).json({
    success: false,
    message: message || 'Internal Server Error',
  });
}

export const API = {
  success,
  error,
  errorWithStatus,
  validationError,
  notFound,
  unauthorized,
  internalServerError,
};
