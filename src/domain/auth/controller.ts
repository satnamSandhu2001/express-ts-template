import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import logger from '#/lib/logger';
import prisma from '#/lib/database';
import { API } from '#/lib/api';
import { login_schema } from './validator';
import { sendAccessToken } from '#/lib/cookies';

// POST /api/v1/auth/signup
export const signup = async (req: Request, res: Response) => {
  try {
    const payload = login_schema.safeParse(req.body);
    if (payload.error)
      return API.validationError(
        res,
        'Invalid request data',
        payload.error.issues
      );

    const { email, password } = payload.data;
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser)
      return API.error(res, 'User already exists with this email');

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      },
    });

    logger.debug(`User registered: ${user.email}`);
    return sendAccessToken(res, user.id, 'User registered successfully', {
      user,
    });
  } catch (error) {
    logger.error('signup error:', error);
    API.internalServerError(res);
  }
};

// POST /api/v1/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const payload = login_schema.safeParse(req.body);
    if (payload.error)
      return API.validationError(
        res,
        'Invalid request data',
        payload.error.issues
      );

    const { email, password } = payload.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return API.error(res, 'Invalid credentials');
    if (!user.isActive) return API.error(res, 'User not authorized');

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return API.error(res, 'Invalid credentials');

    user.password = ''; // remove password from response
    return sendAccessToken(res, user.id, 'Logged in successfully', {
      user,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// GET /api/v1/auth/logout
export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return API.success(res, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout error:', error);
    API.internalServerError(res);
  }
};
