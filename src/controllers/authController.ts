import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';
import { asyncHandler } from '../utils/errors.js';

const authService = new AuthService();

export const register = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password, firstName, lastName, phone } = req.body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const result = await authService.register(
      email,
      password,
      firstName,
      lastName,
      phone
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const result = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    await authService.logout(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required',
      });
    }

    await authService.changePassword(req.user.id, oldPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  }
);
