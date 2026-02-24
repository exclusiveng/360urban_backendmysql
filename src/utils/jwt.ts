import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { JwtPayload } from '../types/index.js';

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret as jwt.Secret, {
    expiresIn: config.jwt.expire,
  } as any);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret as jwt.Secret, {
    expiresIn: config.jwt.refreshExpire,
  } as any);
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
  } catch {
    return null;
  }
};
