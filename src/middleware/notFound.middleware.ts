import { API } from '#/lib/api';
import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  API.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
};
