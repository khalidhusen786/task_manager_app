"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// src/services/authService.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const config_1 = require("../config");
const errors_1 = require("../utils/errors");
console.log("auth services started");
console.log('🔍 AuthService: Creating class...');
class AuthService {
    // -------- REGISTER --------
    async register(data) {
        const existingUser = await User_1.User.findOne({ email: data.email });
        if (existingUser)
            throw new errors_1.AppError('Email already registered', 400);
        const user = new User_1.User(data);
        await user.save();
        const tokens = this.generateTokens(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        const safeUser = this.sanitizeUser(user);
        return { user: safeUser, ...tokens };
    }
    // -------- LOGIN --------
    async login(email, password) {
        const user = await User_1.User.findOne({ email, isActive: true }).select('+password +refreshTokens');
        if (!user)
            throw new errors_1.AppError('Invalid email or password', 401);
        const isValid = await user.comparePassword(password);
        if (!isValid)
            throw new errors_1.AppError('Invalid email or password', 401);
        const tokens = this.generateTokens(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        const safeUser = this.sanitizeUser(user);
        return { user: safeUser, ...tokens };
    }
    // -------- REFRESH TOKEN --------
    async refreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshSecret);
            const user = await User_1.User.findOne({
                _id: decoded.userId,
                refreshTokens: token,
                isActive: true
            }).select('+refreshTokens');
            if (!user)
                throw new errors_1.AppError('Invalid refresh token', 401);
            await user.removeRefreshToken(token);
            const tokens = this.generateTokens(user._id.toString());
            user.refreshTokens.push(tokens.refreshToken);
            await user.save();
            return tokens;
        }
        catch (err) {
            throw new errors_1.AppError('Invalid refresh token', 401);
        }
    }
    // -------- LOGOUT --------
    async logout(userId, token) {
        const user = await User_1.User.findById(userId).select('+refreshTokens');
        if (user)
            await user.removeRefreshToken(token);
    }
    // -------- GET PROFILE --------
    async getUserProfile(userId) {
        const user = await User_1.User.findById(userId);
        if (!user)
            throw new errors_1.AppError('User not found', 404);
        return this.sanitizeUser(user);
    }
    // -------- PRIVATE: GENERATE TOKENS --------
    generateTokens(userId) {
        const payload = { userId };
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.accessTokenExpiry });
        const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwt.refreshSecret, { expiresIn: config_1.config.jwt.refreshTokenExpiry });
        return { accessToken, refreshToken };
    }
    // -------- PRIVATE: SANITIZE USER --------
    sanitizeUser(user) {
        const { _id, name, email, isActive, createdAt, updatedAt } = user;
        return { _id, name, email, isActive, createdAt, updatedAt };
    }
}
exports.AuthService = AuthService;
console.log('🔍 AuthService: Class exported successfully ✅');
