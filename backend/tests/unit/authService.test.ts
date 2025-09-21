// Unit tests for AuthService
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from '@jest/globals';
import { AuthService } from '../../src/services/authService';
import { User } from '../../src/models/User';
import { AppError } from '../../src/utils/errors';
import { setupTestDB, cleanupTestDB, clearCollections, TEST_TIMEOUT } from '../setup';
import jwt from 'jsonwebtoken';
import { JWTUtil } from '../../src/utils/jwt';

describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(async () => {
    await setupTestDB();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await cleanupTestDB();
  }, TEST_TIMEOUT);

  beforeEach(async () => {
    await clearCollections();
    authService = new AuthService();
  });

  afterEach(async () => {
    await clearCollections();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Create first user
      await authService.register(userData);

      // Try to create second user with same email
      await expect(authService.register(userData)).rejects.toThrow(AppError);
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      await authService.register(userData);

      const user = await User.findOne({ email: userData.email }).select('+password');
      expect(user?.password).not.toBe(userData.password);
      expect(user?.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      await authService.register(userData);
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login('test@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error with invalid email', async () => {
      await expect(authService.login('wrong@example.com', 'password123'))
        .rejects.toThrow(AppError);
    });

    it('should throw error with invalid password', async () => {
      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow(AppError);
    });
  });

  describe('refreshToken', () => {
    let refreshToken: string;
    let userId: string;

    beforeEach(async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      const result = await authService.register(userData);
      refreshToken = result.refreshToken;
      userId = result.user._id!;
    });

  it('should refresh token successfully', async () => {
  // Mock generateRefreshToken to return a new token
  const mockRefreshToken = 'new-mock-refresh-token';
  jest.spyOn(JWTUtil, 'generateRefreshToken').mockImplementation(() => mockRefreshToken);
  jest.spyOn(JWTUtil, 'generateAccessToken').mockImplementation(() => 'new-mock-access-token');

  const result = await authService.refreshToken(refreshToken);

  expect(result).toHaveProperty('accessToken', 'new-mock-access-token');
  expect(result).toHaveProperty('refreshToken', mockRefreshToken);

  // Optional: check that old token is removed
  const user = await User.findById(userId).select('+refreshTokens');
  expect(user?.refreshTokens).toContain(mockRefreshToken);
  expect(user?.refreshTokens).not.toContain(refreshToken);
});

    it('should throw error with invalid token', async () => {
      await expect(authService.refreshToken('invalid-token'))
        .rejects.toThrow(AppError);
    });
  });

  describe('logout', () => {
    let refreshToken: string;
    let userId: string;

    beforeEach(async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      const result = await authService.register(userData);
      refreshToken = result.refreshToken;
      userId = result.user._id!;
    });

    it('should logout successfully', async () => {
      await expect(authService.logout(userId, refreshToken))
        .resolves.not.toThrow();
    });
  });

  describe('getUserProfile', () => {
    let userId: string;

    beforeEach(async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      const result = await authService.register(userData);
      userId = result.user._id!;
    });

    it('should get user profile successfully', async () => {
      const user = await authService.getUserProfile(userId);

      expect(user).toHaveProperty('_id', userId);
      expect(user).toHaveProperty('name', 'Test User');
      expect(user).toHaveProperty('email', 'test@example.com');
      expect(user).not.toHaveProperty('password');
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(authService.getUserProfile(fakeId))
        .rejects.toThrow(AppError);
    });
  });
});
