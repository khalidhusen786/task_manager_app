// src/services/authService.ts
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { config } from '../config';
import { AppError } from '../utils/errors';
console.log("auth services started")


interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface AuthResult {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
}

console.log('🔍 AuthService: Creating class...');

export class AuthService {
  // -------- REGISTER --------
  async register(data: RegisterInput): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) throw new AppError('Email already registered', 400);

    const user = new User(data);
    await user.save();

    const tokens = this.generateTokens(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    const safeUser = this.sanitizeUser(user);
    return { user: safeUser, ...tokens };
  }

  // -------- LOGIN --------
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await User.findOne({ email, isActive: true }).select('+password +refreshTokens');
    if (!user) throw new AppError('Invalid email or password', 401);

    const isValid = await user.comparePassword(password);
    if (!isValid) throw new AppError('Invalid email or password', 401);

    const tokens = this.generateTokens(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    const safeUser = this.sanitizeUser(user);
    return { user: safeUser, ...tokens };
  }

  // -------- REFRESH TOKEN --------
  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
      const user = await User.findOne({ 
        _id: decoded.userId, 
        refreshTokens: token, 
        isActive: true 
      }).select('+refreshTokens');

      if (!user) throw new AppError('Invalid refresh token', 401);

      await user.removeRefreshToken(token);
      const tokens = this.generateTokens(user._id.toString());
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      return tokens;
    } catch (err) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  // -------- LOGOUT --------
  async logout(userId: string, token: string): Promise<void> {
    const user = await User.findById(userId).select('+refreshTokens');
    if (user) await user.removeRefreshToken(token);
  }

  // -------- GET PROFILE --------
  async getUserProfile(userId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return this.sanitizeUser(user);
  }

  // -------- PRIVATE: GENERATE TOKENS --------
  private generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    const payload = { userId };
    
    const accessToken = jwt.sign(
      payload,
      config.jwt.secret,
      { expiresIn: config.jwt.accessTokenExpiry as import('jsonwebtoken').SignOptions['expiresIn'] }
    );
    
    const refreshToken = jwt.sign(
      payload,
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshTokenExpiry as import('jsonwebtoken').SignOptions['expiresIn'] }
    );
    
    return { accessToken, refreshToken };
  }

  // -------- PRIVATE: SANITIZE USER --------
  private sanitizeUser(user: IUser): Partial<IUser> {
    const { _id, name, email, isActive, createdAt, updatedAt } = user;
    return { _id, name, email, isActive, createdAt, updatedAt };
  }
}

console.log('🔍 AuthService: Class exported successfully ✅');
