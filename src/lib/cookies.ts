import jwt from 'jsonwebtoken';
import { API } from './api';
import { CookieOptions, Response } from 'express';

export const generateToken = (
  type: 'ACCESS' | 'REFRESH',
  userId: number
): string => {
  const jwtSecret =
    type === 'ACCESS'
      ? (process.env.JWT_SECRET as string)
      : (process.env.REFRESH_TOKEN_SECRET as string);
  if (!jwtSecret) {
    throw new Error('Missing JWT_SECRET env variable');
  }

  const jwtExpiresIn: any = process.env.TOKEN_EXPIRES_IN ?? '7';
  return jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: (jwtExpiresIn + 'd') as any,
  });
};

export const sendAccessToken = (
  res: Response,
  userId: number,
  message: string,
  data?: any
) => {
  let accessToken = generateToken('ACCESS', userId);
  let refreshToken = generateToken('REFRESH', userId);
  const isProd = process.env.NODE_ENV === 'production';

  const baseOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    domain: isProd
      ? process.env.COOKIE_DOMAIN
      : process.env.COOKIE_DOMAIN || 'localhost',
  };

  const accessTokenOptions: CookieOptions = {
    ...baseOptions,
    maxAge:
      parseInt((process.env.TOKEN_EXPIRES_IN as string) ?? 7) *
      24 *
      60 *
      60 *
      1000,
  };
  const refreshTokenOptions: CookieOptions = {
    ...baseOptions,
    maxAge:
      parseInt((process.env.REFRESH_TOKEN_EXPIRES_IN as string) ?? 30) *
      24 *
      60 *
      60 *
      1000,
  };

  res.cookie('accessToken', accessToken, accessTokenOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenOptions);
  API.success(res, message, { ...data });
};
