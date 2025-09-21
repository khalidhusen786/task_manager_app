// ===== src/utils/jwt.ts =====
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errors';

export interface JWTPayload {
  userId: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export class JWTUtil {
  /**
   * Generate access token
   */
  static generateAccessToken(userId: string): string {
    const payload: JWTPayload = {
      userId,
      type: 'access'
    };

    return jwt.sign(payload, config.jwt.secret as Secret, {
      expiresIn: config.jwt.accessTokenExpiry as string,
      issuer: 'task-manager-api',
      audience: 'task-manager-client',
    } as SignOptions);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string): string {
    const payload: JWTPayload = {
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000) // Add random component for uniqueness
    };

    return jwt.sign(payload, config.jwt.refreshSecret as Secret, {
      expiresIn: config.jwt.refreshTokenExpiry as string,
      issuer: 'task-manager-api',
      audience: 'task-manager-client',
    } as SignOptions);
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: 'task-manager-api',
        audience: 'task-manager-client',
      }) as JWTPayload;

      if (decoded.type !== 'access') {
        throw new AppError('Invalid token type', 401);
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid access token', 401);
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Access token expired', 401);
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'task-manager-api',
        audience: 'task-manager-client',
      }) as JWTPayload;

      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid token type', 401);
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401);
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired', 401);
      }
      throw error;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(userId),
      refreshToken: this.generateRefreshToken(userId),
    };
  }

  /**
   * Check if token is expired (without throwing error)
   */
  static isTokenExpired(token: string): boolean {
    try {
      jwt.verify(token, config.jwt.secret);
      return false;
    } catch (error) {
      return error instanceof jwt.TokenExpiredError;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}