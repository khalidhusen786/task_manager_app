// ===== src/middleware/authMiddleware.ts =====
import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt';
import { CookieUtil } from '../utils/cookies';
import { User } from '../models/User';
import { AppError, AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

/**
 * Middleware to authenticate user using JWT token
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to extract token from cookie first, then from Authorization header
    let token = CookieUtil.extractTokenFromCookie(req.headers.cookie, 'accessToken');
    
    if (!token) {
      token = JWTUtil.extractTokenFromHeader(req.headers.authorization);
    }

    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    // Verify and decode token
    const decoded = JWTUtil.verifyAccessToken(token);

    // Find user in database
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    // Add user to request object
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    logger.debug('User authenticated successfully', {
      userId: user._id,
      email: user.email,
      endpoint: req.path,
      method: req.method,
      authMethod: req.headers.cookie ? 'cookie' : 'header',
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      hasCookie: !!req.headers.cookie,
      hasHeader: !!req.headers.authorization,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method,
    });
    
    next(error);
  }
};

/**
 * Optional authentication middleware - doesn't throw error if no token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JWTUtil.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = JWTUtil.verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');
      
      if (user && user.isActive) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    logger.debug('Optional auth failed, continuing without user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint: req.path,
    });
    next();
  }
};

/**
 * Middleware to check if user owns the resource
 */
export const checkResourceOwnership = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const resourceId = req.params[resourceIdParam];

      if (!userId) {
        throw new AuthenticationError('User not authenticated');
      }

      // This would typically involve checking the resource ownership
      // Implementation depends on your specific resource models
      logger.debug('Resource ownership check', {
        userId,
        resourceId,
        endpoint: req.path,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};