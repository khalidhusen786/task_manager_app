"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const logger_1 = require("../utils/logger");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        // -------------------- REGISTER --------------------
        this.register = async (req, res, next) => {
            console.log("🔥 Register route hit", req.body);
            try {
                const { name, email, password } = req.body;
                const result = await this.authService.register({ name, email, password });
                logger_1.logger.info('User registered successfully', { userId: result.user._id, email });
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // -------------------- LOGIN --------------------
        this.login = async (req, res, next) => {
            try {
                const { email, password } = req.body;
                const result = await this.authService.login(email, password);
                logger_1.logger.info('User logged in successfully', { userId: result.user._id, email });
                res.json({
                    success: true,
                    message: 'Login successful',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // -------------------- REFRESH TOKEN --------------------
        this.refreshToken = async (req, res, next) => {
            try {
                const { refreshToken } = req.body;
                const tokens = await this.authService.refreshToken(refreshToken);
                res.json({
                    success: true,
                    message: 'Token refreshed successfully',
                    data: tokens,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // -------------------- LOGOUT --------------------
        this.logout = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                const { refreshToken } = req.body;
                await this.authService.logout(userId, refreshToken);
                logger_1.logger.info('User logged out', { userId });
                res.json({
                    success: true,
                    message: 'Logout successful',
                });
            }
            catch (error) {
                next(error);
            }
        };
        // -------------------- GET PROFILE --------------------
        this.getProfile = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                const user = await this.authService.getUserProfile(userId);
                res.json({
                    success: true,
                    data: user,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuthController = AuthController;
