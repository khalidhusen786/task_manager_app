"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkResourceOwnership = exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const cookies_1 = require("../utils/cookies");
const User_1 = require("../models/User");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
/**
 * Middleware to authenticate user using JWT token
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Try to extract token from cookie first, then from Authorization header
        let token = cookies_1.CookieUtil.extractTokenFromCookie(req.headers.cookie, 'accessToken');
        if (!token) {
            token = jwt_1.JWTUtil.extractTokenFromHeader(req.headers.authorization);
        }
        if (!token) {
            throw new errors_1.AuthenticationError('Access token required');
        }
        // Verify and decode token
        const decoded = jwt_1.JWTUtil.verifyAccessToken(token);
        // Find user in database
        const user = await User_1.User.findById(decoded.userId).select('-password -refreshTokens');
        if (!user || !user.isActive) {
            throw new errors_1.AuthenticationError('User not found or inactive');
        }
        // Add user to request object
        req.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
        };
        logger_1.logger.debug('User authenticated successfully', {
            userId: user._id,
            email: user.email,
            endpoint: req.path,
            method: req.method,
            authMethod: req.headers.cookie ? 'cookie' : 'header',
        });
        next();
    }
    catch (error) {
        logger_1.logger.warn('Authentication failed', {
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
exports.authenticateToken = authenticateToken;
/**
 * Optional authentication middleware - doesn't throw error if no token
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = jwt_1.JWTUtil.extractTokenFromHeader(req.headers.authorization);
        if (token) {
            const decoded = jwt_1.JWTUtil.verifyAccessToken(token);
            const user = await User_1.User.findById(decoded.userId).select('-password -refreshTokens');
            if (user && user.isActive) {
                req.user = {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                };
            }
        }
        next();
    }
    catch (error) {
        // For optional auth, we don't throw errors, just continue without user
        logger_1.logger.debug('Optional auth failed, continuing without user', {
            error: error instanceof Error ? error.message : 'Unknown error',
            endpoint: req.path,
        });
        next();
    }
};
exports.optionalAuth = optionalAuth;
/**
 * Middleware to check if user owns the resource
 */
const checkResourceOwnership = (resourceIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const resourceId = req.params[resourceIdParam];
            if (!userId) {
                throw new errors_1.AuthenticationError('User not authenticated');
            }
            // This would typically involve checking the resource ownership
            // Implementation depends on your specific resource models
            logger_1.logger.debug('Resource ownership check', {
                userId,
                resourceId,
                endpoint: req.path,
            });
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.checkResourceOwnership = checkResourceOwnership;
