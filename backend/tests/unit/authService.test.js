"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Unit tests for AuthService
const globals_1 = require("@jest/globals");
const authService_1 = require("../../src/services/authService");
const User_1 = require("../../src/models/User");
const errors_1 = require("../../src/utils/errors");
const setup_1 = require("../setup");
(0, globals_1.describe)('AuthService', () => {
    let authService;
    (0, globals_1.beforeAll)(async () => {
        await (0, setup_1.setupTestDB)();
    }, setup_1.TEST_TIMEOUT);
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)();
    }, setup_1.TEST_TIMEOUT);
    (0, globals_1.beforeEach)(async () => {
        await (0, setup_1.clearCollections)();
        authService = new authService_1.AuthService();
    });
    (0, globals_1.afterEach)(async () => {
        await (0, setup_1.clearCollections)();
    });
    (0, globals_1.describe)('register', () => {
        (0, globals_1.it)('should register a new user successfully', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            const result = await authService.register(userData);
            (0, globals_1.expect)(result).toHaveProperty('user');
            (0, globals_1.expect)(result).toHaveProperty('accessToken');
            (0, globals_1.expect)(result).toHaveProperty('refreshToken');
            (0, globals_1.expect)(result.user.email).toBe(userData.email);
            (0, globals_1.expect)(result.user.name).toBe(userData.name);
            (0, globals_1.expect)(result.user).not.toHaveProperty('password');
        });
        (0, globals_1.it)('should throw error if email already exists', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            // Create first user
            await authService.register(userData);
            // Try to create second user with same email
            await (0, globals_1.expect)(authService.register(userData)).rejects.toThrow(errors_1.AppError);
        });
        (0, globals_1.it)('should hash password before saving', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            await authService.register(userData);
            const user = await User_1.User.findOne({ email: userData.email }).select('+password');
            (0, globals_1.expect)(user?.password).not.toBe(userData.password);
            (0, globals_1.expect)(user?.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
        });
    });
    (0, globals_1.describe)('login', () => {
        (0, globals_1.beforeEach)(async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            await authService.register(userData);
        });
        (0, globals_1.it)('should login with valid credentials', async () => {
            const result = await authService.login('test@example.com', 'password123');
            (0, globals_1.expect)(result).toHaveProperty('user');
            (0, globals_1.expect)(result).toHaveProperty('accessToken');
            (0, globals_1.expect)(result).toHaveProperty('refreshToken');
            (0, globals_1.expect)(result.user.email).toBe('test@example.com');
        });
        (0, globals_1.it)('should throw error with invalid email', async () => {
            await (0, globals_1.expect)(authService.login('wrong@example.com', 'password123'))
                .rejects.toThrow(errors_1.AppError);
        });
        (0, globals_1.it)('should throw error with invalid password', async () => {
            await (0, globals_1.expect)(authService.login('test@example.com', 'wrongpassword'))
                .rejects.toThrow(errors_1.AppError);
        });
    });
    (0, globals_1.describe)('refreshToken', () => {
        let refreshToken;
        let userId;
        (0, globals_1.beforeEach)(async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            const result = await authService.register(userData);
            refreshToken = result.refreshToken;
            userId = result.user._id;
        });
        (0, globals_1.it)('should refresh token successfully', async () => {
            const result = await authService.refreshToken(refreshToken);
            (0, globals_1.expect)(result).toHaveProperty('accessToken');
            (0, globals_1.expect)(result).toHaveProperty('refreshToken');
            (0, globals_1.expect)(result.refreshToken).not.toBe(refreshToken); // Should be new token
        });
        (0, globals_1.it)('should throw error with invalid token', async () => {
            await (0, globals_1.expect)(authService.refreshToken('invalid-token'))
                .rejects.toThrow(errors_1.AppError);
        });
    });
    (0, globals_1.describe)('logout', () => {
        let refreshToken;
        let userId;
        (0, globals_1.beforeEach)(async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            const result = await authService.register(userData);
            refreshToken = result.refreshToken;
            userId = result.user._id;
        });
        (0, globals_1.it)('should logout successfully', async () => {
            await (0, globals_1.expect)(authService.logout(userId, refreshToken))
                .resolves.not.toThrow();
        });
    });
    (0, globals_1.describe)('getUserProfile', () => {
        let userId;
        (0, globals_1.beforeEach)(async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            const result = await authService.register(userData);
            userId = result.user._id;
        });
        (0, globals_1.it)('should get user profile successfully', async () => {
            const user = await authService.getUserProfile(userId);
            (0, globals_1.expect)(user).toHaveProperty('_id', userId);
            (0, globals_1.expect)(user).toHaveProperty('name', 'Test User');
            (0, globals_1.expect)(user).toHaveProperty('email', 'test@example.com');
            (0, globals_1.expect)(user).not.toHaveProperty('password');
        });
        (0, globals_1.it)('should throw error for non-existent user', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            await (0, globals_1.expect)(authService.getUserProfile(fakeId))
                .rejects.toThrow(errors_1.AppError);
        });
    });
});
