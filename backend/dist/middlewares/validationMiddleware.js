"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequest = exports.commonSchemas = exports.sanitizeInput = exports.validate = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
/**
 * Middleware to validate request data using Zod schemas
 */
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const validationResults = {};
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
            logger_1.logger.debug('Request validation successful', {
                endpoint: req.path,
                method: req.method,
                userId: req.user?.id,
                validatedFields: Object.keys(validationResults),
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const validationErrors = error.issues.map((err) => ({
                    field: err.path.join('.') || 'root',
                    message: err.message,
                    code: err.code,
                    received: err.received,
                    expected: err.expected,
                }));
                logger_1.logger.warn('Request validation failed', {
                    endpoint: req.path,
                    method: req.method,
                    userId: req.user?.id,
                    errors: validationErrors,
                    body: req.body,
                    params: req.params,
                    query: req.query,
                });
                next(new errors_1.ValidationError('Validation failed', validationErrors));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
/**
 * Sanitize input middleware - removes potentially dangerous characters
 */
const sanitizeInput = (req, res, next) => {
    const sanitizeObject = (obj) => {
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
            const sanitized = {};
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
exports.sanitizeInput = sanitizeInput;
// Common validation schemas
exports.commonSchemas = {
    mongoId: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID'),
    }),
    pagination: zod_1.z.object({
        page: zod_1.z.string().optional().transform((val) => val ? parseInt(val) : 1),
        limit: zod_1.z.string().optional().transform((val) => {
            const parsed = val ? parseInt(val) : 10;
            return Math.min(parsed, 100); // Max 100 items per page
        }),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
    search: zod_1.z.object({
        q: zod_1.z.string().min(1).max(100).optional(),
        filter: zod_1.z.string().optional(),
    }),
};
/**
 * Request logging middleware
 */
const logRequest = (req, res, next) => {
    const startTime = Date.now();
    // Log request
    logger_1.logger.info('Incoming request', {
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
        logger_1.logger.info('Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id,
        });
    });
    next();
};
exports.logRequest = logRequest;
