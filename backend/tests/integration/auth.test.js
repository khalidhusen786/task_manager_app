"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Integration tests for Auth endpoints
const supertest_1 = __importDefault(require("supertest"));
const globals_1 = require("@jest/globals");
const server_1 = __importDefault(require("../../src/server"));
const setup_1 = require("../setup");
(0, globals_1.describe)('Auth Integration Tests', () => {
    (0, globals_1.beforeAll)(async () => {
        await (0, setup_1.setupTestDB)();
    }, setup_1.TEST_TIMEOUT);
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.cleanupTestDB)();
    }, setup_1.TEST_TIMEOUT);
    (0, globals_1.beforeEach)(async () => {
        await (0, setup_1.clearCollections)();
    });
    (0, globals_1.afterEach)(async () => {
        await (0, setup_1.clearCollections)();
    });
    (0, globals_1.describe)('POST /api/auth/register', () => {
        (0, globals_1.it)('should register a new user successfully', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.message).toBe('User registered successfully');
            (0, globals_1.expect)(response.body.data).toHaveProperty('user');
            (0, globals_1.expect)(response.body.data).toHaveProperty('accessToken');
            (0, globals_1.expect)(response.body.data).toHaveProperty('refreshToken');
            (0, globals_1.expect)(response.body.data.user.email).toBe(userData.email);
            (0, globals_1.expect)(response.body.data.user.name).toBe(userData.name);
            (0, globals_1.expect)(response.body.data.user).not.toHaveProperty('password');
        });
        (0, globals_1.it)('should return 400 for invalid email format', async () => {
            const userData = {
                name: 'Test User',
                email: 'invalid-email',
                password: 'password123'
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('should return 400 for short password', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: '123'
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('should return 400 for missing required fields', async () => {
            const userData = {
                name: 'Test User'
                // Missing email and password
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('should return 400 for duplicate email', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            // Register first user
            await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            // Try to register with same email
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            (0, globals_1.expect)(response.body.success).toBe(false);
            (0, globals_1.expect)(response.body.message).toContain('Email already registered');
        });
    });
    (0, globals_1.describe)('POST /api/auth/login', () => {
        (0, globals_1.beforeEach)(async () => {
            // Create a test user
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send(userData);
        });
        (0, globals_1.it)('should login with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.message).toBe('Login successful');
            (0, globals_1.expect)(response.body.data).toHaveProperty('user');
            (0, globals_1.expect)(response.body.data).toHaveProperty('accessToken');
            (0, globals_1.expect)(response.body.data).toHaveProperty('refreshToken');
            (0, globals_1.expect)(response.body.data.user.email).toBe(loginData.email);
        });
        (0, globals_1.it)('should return 401 for invalid email', async () => {
            const loginData = {
                email: 'wrong@example.com',
                password: 'password123'
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
            (0, globals_1.expect)(response.body.message).toContain('Invalid email or password');
        });
        (0, globals_1.it)('should return 401 for invalid password', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
            (0, globals_1.expect)(response.body.message).toContain('Invalid email or password');
        });
        (0, globals_1.it)('should return 400 for missing credentials', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/login')
                .send({})
                .expect(400);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('POST /api/auth/refresh-token', () => {
        let refreshToken;
        (0, globals_1.beforeEach)(async () => {
            // Create a test user and get refresh token
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            const registerResponse = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send(userData);
            refreshToken = registerResponse.body.data.refreshToken;
        });
        (0, globals_1.it)('should refresh token successfully', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/refresh-token')
                .send({ refreshToken })
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.message).toBe('Token refreshed successfully');
            (0, globals_1.expect)(response.body.data).toHaveProperty('accessToken');
            (0, globals_1.expect)(response.body.data).toHaveProperty('refreshToken');
            (0, globals_1.expect)(response.body.data.refreshToken).not.toBe(refreshToken); // Should be new token
        });
        (0, globals_1.it)('should return 401 for invalid refresh token', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/refresh-token')
                .send({ refreshToken: 'invalid-token' })
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
            (0, globals_1.expect)(response.body.message).toContain('Invalid refresh token');
        });
        (0, globals_1.it)('should return 400 for missing refresh token', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/refresh-token')
                .send({})
                .expect(400);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('POST /api/auth/logout', () => {
        let accessToken;
        let refreshToken;
        (0, globals_1.beforeEach)(async () => {
            // Create a test user and get tokens
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            const registerResponse = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send(userData);
            accessToken = registerResponse.body.data.accessToken;
            refreshToken = registerResponse.body.data.refreshToken;
        });
        (0, globals_1.it)('should logout successfully with valid token', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ refreshToken })
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.message).toBe('Logout successful');
        });
        (0, globals_1.it)('should return 401 for invalid access token', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/logout')
                .set('Authorization', 'Bearer invalid-token')
                .send({ refreshToken })
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('should return 401 for missing access token', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/logout')
                .send({ refreshToken })
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, globals_1.describe)('GET /api/auth/profile', () => {
        let accessToken;
        (0, globals_1.beforeEach)(async () => {
            // Create a test user and get access token
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            const registerResponse = await (0, supertest_1.default)(server_1.default)
                .post('/api/auth/register')
                .send(userData);
            accessToken = registerResponse.body.data.accessToken;
        });
        (0, globals_1.it)('should get user profile successfully', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            (0, globals_1.expect)(response.body.success).toBe(true);
            (0, globals_1.expect)(response.body.data).toHaveProperty('_id');
            (0, globals_1.expect)(response.body.data).toHaveProperty('name', 'Test User');
            (0, globals_1.expect)(response.body.data).toHaveProperty('email', 'test@example.com');
            (0, globals_1.expect)(response.body.data).not.toHaveProperty('password');
        });
        (0, globals_1.it)('should return 401 for invalid access token', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
        (0, globals_1.it)('should return 401 for missing access token', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/auth/profile')
                .expect(401);
            (0, globals_1.expect)(response.body.success).toBe(false);
        });
    });
});
