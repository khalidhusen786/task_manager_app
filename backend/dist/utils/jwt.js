"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTUtil = void 0;
// ===== src/utils/jwt.ts =====
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const errors_1 = require("./errors");
class JWTUtil {
    /**
     * Generate access token
     */
    static generateAccessToken(userId) {
        const payload = {
            userId,
            type: 'access'
        };
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.accessTokenExpiry,
            issuer: 'task-manager-api',
            audience: 'task-manager-client',
        });
    }
    /**
     * Generate refresh token
     */
    static generateRefreshToken(userId) {
        const payload = {
            userId,
            type: 'refresh'
        };
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.refreshSecret, {
            expiresIn: config_1.config.jwt.refreshTokenExpiry,
            issuer: 'task-manager-api',
            audience: 'task-manager-client',
        });
    }
    /**
     * Verify access token
     */
    static verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret, {
                issuer: 'task-manager-api',
                audience: 'task-manager-client',
            });
            if (decoded.type !== 'access') {
                throw new errors_1.AppError('Invalid token type', 401);
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errors_1.AppError('Invalid access token', 401);
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errors_1.AppError('Access token expired', 401);
            }
            throw error;
        }
    }
    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshSecret, {
                issuer: 'task-manager-api',
                audience: 'task-manager-client',
            });
            if (decoded.type !== 'refresh') {
                throw new errors_1.AppError('Invalid token type', 401);
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errors_1.AppError('Invalid refresh token', 401);
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errors_1.AppError('Refresh token expired', 401);
            }
            throw error;
        }
    }
    /**
     * Extract token from Authorization header
     */
    static extractTokenFromHeader(authHeader) {
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
    static generateTokenPair(userId) {
        return {
            accessToken: this.generateAccessToken(userId),
            refreshToken: this.generateRefreshToken(userId),
        };
    }
    /**
     * Check if token is expired (without throwing error)
     */
    static isTokenExpired(token) {
        try {
            jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
            return false;
        }
        catch (error) {
            return error instanceof jsonwebtoken_1.default.TokenExpiredError;
        }
    }
    /**
     * Decode token without verification (for debugging)
     */
    static decodeToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch (error) {
            return null;
        }
    }
}
exports.JWTUtil = JWTUtil;
