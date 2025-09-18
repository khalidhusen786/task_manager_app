"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieUtil = void 0;
const config_1 = require("../config");
class CookieUtil {
    /**
     * Set secure HTTP-only cookie
     */
    static setCookie(res, name, value, options = {}) {
        const defaultOptions = {
            httpOnly: true,
            secure: config_1.config.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/',
        };
        const cookieOptions = { ...defaultOptions, ...options };
        res.cookie(name, value, {
            httpOnly: cookieOptions.httpOnly,
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite,
            maxAge: cookieOptions.maxAge,
            path: cookieOptions.path,
        });
    }
    /**
     * Set access token cookie
     */
    static setAccessTokenCookie(res, token) {
        this.setCookie(res, 'accessToken', token, {
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
    }
    /**
     * Set refresh token cookie
     */
    static setRefreshTokenCookie(res, token) {
        this.setCookie(res, 'refreshToken', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
    /**
     * Clear authentication cookies
     */
    static clearAuthCookies(res) {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: config_1.config.nodeEnv === 'production',
            sameSite: 'strict',
            path: '/',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: config_1.config.nodeEnv === 'production',
            sameSite: 'strict',
            path: '/',
        });
    }
    /**
     * Extract token from cookie
     */
    static extractTokenFromCookie(cookieHeader, tokenName) {
        if (!cookieHeader)
            return null;
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split('=');
            acc[name] = value;
            return acc;
        }, {});
        return cookies[tokenName] || null;
    }
}
exports.CookieUtil = CookieUtil;
