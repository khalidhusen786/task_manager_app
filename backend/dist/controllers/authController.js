"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const cookies_1 = require("../utils/cookies");
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const logger_1 = require("../utils/logger");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        // -------------------- REGISTER --------------------
        this.register = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const { name, email, password } = req.body;
            const result = await this.authService.register({ name, email, password });
            // Set secure HTTP-only cookies
            cookies_1.CookieUtil.setAccessTokenCookie(res, result.accessToken);
            cookies_1.CookieUtil.setRefreshTokenCookie(res, result.refreshToken);
            logger_1.logger.info('User registered successfully', { userId: result.user._id, email });
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: result.user,
                    // Don't send tokens in response body for security
                },
            });
        });
        // -------------------- LOGIN --------------------
        this.login = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            // Set secure HTTP-only cookies
            cookies_1.CookieUtil.setAccessTokenCookie(res, result.accessToken);
            cookies_1.CookieUtil.setRefreshTokenCookie(res, result.refreshToken);
            logger_1.logger.info('User logged in successfully', { userId: result.user._id, email });
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    // Don't send tokens in response body for security
                },
            });
        });
        // -------------------- REFRESH TOKEN --------------------
        this.refreshToken = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            // Try to get refresh token from cookie first, then from body
            let refreshToken = cookies_1.CookieUtil.extractTokenFromCookie(req.headers.cookie, 'refreshToken');
            if (!refreshToken) {
                refreshToken = req.body.refreshToken;
            }
            if (!refreshToken) {
                throw new Error('Refresh token required');
            }
            const tokens = await this.authService.refreshToken(refreshToken);
            // Set new tokens in cookies
            cookies_1.CookieUtil.setAccessTokenCookie(res, tokens.accessToken);
            cookies_1.CookieUtil.setRefreshTokenCookie(res, tokens.refreshToken);
            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                // Don't send tokens in response body for security
                },
            });
        });
        // -------------------- LOGOUT --------------------
        this.logout = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            // Try to get refresh token from cookie first, then from body
            let refreshToken = cookies_1.CookieUtil.extractTokenFromCookie(req.headers.cookie, 'refreshToken');
            if (!refreshToken) {
                refreshToken = req.body.refreshToken;
            }
            if (userId && refreshToken) {
                await this.authService.logout(userId, refreshToken);
            }
            // Clear authentication cookies
            cookies_1.CookieUtil.clearAuthCookies(res);
            logger_1.logger.info('User logged out', { userId });
            res.json({
                success: true,
                message: 'Logout successful',
            });
        });
        // -------------------- GET PROFILE --------------------
        this.getProfile = (0, errorMiddleware_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const user = await this.authService.getUserProfile(userId);
            res.json({
                success: true,
                data: user,
            });
        });
    }
}
exports.AuthController = AuthController;
