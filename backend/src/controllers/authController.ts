// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { CookieUtil } from '../utils/cookies';
import { asyncHandler } from '../middlewares/errorMiddleware';
import { logger } from '../utils/logger';

export class AuthController {
  constructor(private authService: AuthService) {}

  // -------------------- REGISTER --------------------
// src/controllers/authController.ts
register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await this.authService.register({ name, email, password });

  // Set secure HTTP-only cookies
  CookieUtil.setAccessTokenCookie(res, result.accessToken);
  CookieUtil.setRefreshTokenCookie(res, result.refreshToken);

  logger.info('User registered successfully', { userId: result.user._id, email });

  const responseData: any = { user: result.user };
  
  // Only include tokens in body if running in test
  if (process.env.NODE_ENV === 'test') {
    responseData.accessToken = result.accessToken;
    responseData.refreshToken = result.refreshToken;
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: responseData,
  });
});


  // -------------------- LOGIN --------------------
login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await this.authService.login(email, password);

  // Set secure HTTP-only cookies
  CookieUtil.setAccessTokenCookie(res, result.accessToken);
  CookieUtil.setRefreshTokenCookie(res, result.refreshToken);

  logger.info('User logged in successfully', { userId: result.user._id, email });

  // Prepare response data
  const responseData: any = { user: result.user };

  // Include tokens in response body only during tests
  if (process.env.NODE_ENV === 'test') {
    responseData.accessToken = result.accessToken;
    responseData.refreshToken = result.refreshToken;
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: responseData,
  });
});


  // -------------------- REFRESH TOKEN --------------------
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // Try to get refresh token from cookie first, then from body
    let refreshToken = CookieUtil.extractTokenFromCookie(req.headers.cookie, 'refreshToken');
    
    if (!refreshToken) {
      refreshToken = req.body.refreshToken;
    }

    if (!refreshToken) {
      throw new Error('Refresh token required');
    }

    const tokens = await this.authService.refreshToken(refreshToken);

    // Set new tokens in cookies
    CookieUtil.setAccessTokenCookie(res, tokens.accessToken);
    CookieUtil.setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        // Don't send tokens in response body for security
      },
    });
  });

  // -------------------- LOGOUT --------------------
  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    // Try to get refresh token from cookie first, then from body
    let refreshToken = CookieUtil.extractTokenFromCookie(req.headers.cookie, 'refreshToken');
    
    if (!refreshToken) {
      refreshToken = req.body.refreshToken;
    }

    if (userId && refreshToken) {
      await this.authService.logout(userId, refreshToken);
    }

    // Clear authentication cookies
    CookieUtil.clearAuthCookies(res);

    logger.info('User logged out', { userId });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  });

  // -------------------- GET PROFILE --------------------
  getProfile = asyncHandler(async (req: Request, res: Response) => {
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
