// ===== src/middleware/validationMiddleware.ts =====
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Middleware to validate request data using Zod schemas
 */
export const validate = (schema: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validationResults: any = {};

      // Validate request body
      if (schema.body) {
        validationResults.body = schema.body.parse(req.body);
        req.body = validationResults.body;
      }

      // Validate request params
      if (schema.params) {
        validationResults.params = schema.params.parse(req.params);
        req.params = validationResults.params;
      }

      // Validate request query
      if (schema.query) {
        validationResults.query = schema.query.parse(req.query);
        req.query = validationResults.query;
      }

      logger.debug('Request validation successful', {
        endpoint: req.path,
        method: req.method,
        userId: req.user?.id,
        validatedFields: Object.keys(validationResults),
      });

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.issues.map((err) => ({
          field: err.path.join('.') || 'root',
          message: err.message,
          code: err.code,
          received: (err as any).received,
          expected: (err as any).expected,
        }));

        logger.warn('Request validation failed', {
          endpoint: req.path,
          method: req.method,
          userId: req.user?.id,
          errors: validationErrors,
          body: req.body,
          params: req.params,
          query: req.query,
        });

        next(new ValidationError('Validation failed', validationErrors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Sanitize input middleware - removes potentially dangerous characters
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potential XSS characters
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize body, params, and query
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Common validation schemas
export const commonSchemas = {
  mongoId: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID'),
  }),

  pagination: z.object({
    page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? parseInt(val) : 10;
      return Math.min(parsed, 100); // Max 100 items per page
    }),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),

  search: z.object({
    q: z.string().min(1).max(100).optional(),
    filter: z.string().optional(),
  }),
};

/**
 * Request logging middleware
 */
export const logRequest = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
    });
  });

  next();
};