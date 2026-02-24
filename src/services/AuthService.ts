import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database.js';
import { User, UserRole } from '../entities/User.js';
import { AppError } from '../utils/errors.js';
import { validateEmail, validatePasswordStrength } from '../utils/validators.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { config } from '../config/config.js';
import { JwtPayload, AuthResponse } from '../types/index.js';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string
  ): Promise<AuthResponse> {
    // Validate email
    if (!validateEmail(email)) {
      throw new AppError(400, 'Invalid email format');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new AppError(400, 'Password does not meet requirements', {
        password: passwordValidation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new AppError(409, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      config.bcrypt.rounds
    );

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: UserRole.AGENT, // Default role
    });

    await this.userRepository.save(user);

    // Generate tokens
    const jwtPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Store refresh token in database
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate tokens
    const jwtPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Store refresh token
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
  }> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    // Check if refresh token matches stored one
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError(401, 'Refresh token mismatch');
    }

    // Generate new access token
    const jwtPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user) {
      user.refreshToken = null;
      await this.userRepository.save(user);
    }
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new AppError(401, 'Current password is incorrect');
    }

    // Validate new password
    const validation = validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new AppError(400, 'New password does not meet requirements', {
        newPassword: validation.errors,
      });
    }

    // Hash and update password
    user.password = await bcrypt.hash(newPassword, config.bcrypt.rounds);
    await this.userRepository.save(user);
  }
}
