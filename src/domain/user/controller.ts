import { API } from '#/lib/api';
import { Response } from 'express';
import logger from '#/lib/logger';
import { AuthRequest } from '../auth/middleware';

// GET /user/profile
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    return API.success(res, 'Profile fetched successfully', { user: req.user });
  } catch (error) {
    logger.error('Get my profile error:', error);
    API.internalServerError(res);
  }
};
