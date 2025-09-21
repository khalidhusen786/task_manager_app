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

  // Return tokens in response
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});


  // -------------------- LOGIN --------------------
login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await this.authService.login(email, password);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});



  // -------------------- REFRESH TOKEN --------------------
refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new Error('Refresh token required');

  const tokens = await this.authService.refreshToken(refreshToken);

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: tokens,
  });
});


  // -------------------- LOGOUT --------------------
  logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken, userId } = req.body;
  if (userId && refreshToken) {
    await this.authService.logout(userId, refreshToken);
  }

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
