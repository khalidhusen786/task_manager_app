// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';

export class AuthController {
  constructor(private authService: AuthService) {}

  // -------------------- REGISTER --------------------
  register = async (req: Request, res: Response, next: NextFunction) => {
      console.log("🔥 Register route hit", req.body);

    try {
      const { name, email, password } = req.body;
      const result = await this.authService.register({ name, email, password });

      logger.info('User registered successfully', { userId: result.user._id, email });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // -------------------- LOGIN --------------------
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      logger.info('User logged in successfully', { userId: result.user._id, email });

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // -------------------- REFRESH TOKEN --------------------
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  // -------------------- LOGOUT --------------------
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { refreshToken } = req.body;

      await this.authService.logout(userId!, refreshToken);

      logger.info('User logged out', { userId });

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  };

  // -------------------- GET PROFILE --------------------
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const user = await this.authService.getUserProfile(userId!);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };


}
