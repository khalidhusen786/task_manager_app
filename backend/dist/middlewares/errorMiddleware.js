"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Global error handling middleware
 */
const errorHandler = (error, req, res, next) => {
    // Log error details
    logger_1.logger.error('Error occurred', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.method !== 'GET' ? req.body : undefined,
        params: req.params,
        query: req.query,
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
    });
    // Default error values
    let statusCode = 500;
    let message = 'Internal server error';
    let details = null;
    // Handle different types of errors
    if (error instanceof errors_1.AppError) {
        statusCode = error.statusCode;
        message = error.message;
        if ('details' in error) {
            details = error.details;
        }
    }
    else if (error instanceof mongoose_1.default.Error.ValidationError) {
        statusCode = 400;
        message = 'Validation error';
        details = Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
            value: err.value,
            kind: err.kind,
        }));
    }
    else if (error instanceof mongoose_1.default.Error.CastError) {
        statusCode = 400;
        message = `Invalid ${error.path}: ${error.value}`;
    }
    else if (error.name === 'MongoServerError' && error.code === 11000) {
        statusCode = 409;
        message = 'Duplicate key error';
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        details = `${field} '${value}' already exists`;
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    else if (error.name === 'SyntaxError' && 'body' in error) {
        statusCode = 400;
        message = 'Invalid JSON in request body';
    }
    else if (error.name === 'MulterError') {
        statusCode = 400;
        message = 'File upload error';
    }
    else if (error.name === 'TypeError' && error.message.includes('Cannot read property')) {
        statusCode = 400;
        message = 'Invalid request data';
    }
    // Send error response
    const errorResponse = {
        success: false,
        message,
        error: {
            type: error.name,
            ...(details && { details }),
        },
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack,
            request: {
                method: req.method,
                url: req.url,
                params: req.params,
                query: req.query,
            },
        }),
    };
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new errors_1.AppError(`Route ${req.method} ${req.originalUrl} not found`, 404);
    logger_1.logger.warn('Route not found', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    next(error);
};
exports.notFoundHandler = notFoundHandler;
/**
 * Async error handler wrapper
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
