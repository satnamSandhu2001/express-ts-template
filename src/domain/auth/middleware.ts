import { API } from '#/lib/api';
import prisma from '#/lib/database';
import logger from '#/lib/logger';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('cookies: ', req.cookies);
    const token = req.cookies?.accessToken;
    if (!token) {
      API.unauthorized(res);
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findFirst({
      where: { id: decoded.id },
      select: { id: true, email: true, isActive: true },
    });

    if (!user || !user.isActive) {
      API.unauthorized(res, 'Invalid token or user is unauthorized');
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    API.internalServerError(res);
  }
};
