// ===== src/utils/cookies.ts =====
import { Response } from 'express';
import { config } from '../config';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

export class CookieUtil {
  /**
   * Set secure HTTP-only cookie
   */
  static setCookie(
    res: Response,
    name: string,
    value: string,
    options: Partial<CookieOptions> = {}
  ): void {
    const defaultOptions: CookieOptions = {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    };

    const cookieOptions = { ...defaultOptions, ...options };

    res.cookie(name, value, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path,
    });
  }

  /**
   * Set access token cookie
   */
  static setAccessTokenCookie(res: Response, token: string): void {
    this.setCookie(res, 'accessToken', token, {
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
  }

  /**
   * Set refresh token cookie
   */
  static setRefreshTokenCookie(res: Response, token: string): void {
    this.setCookie(res, 'refreshToken', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  /**
   * Clear authentication cookies
   */
  static clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  /**
   * Extract token from cookie
   */
  static extractTokenFromCookie(cookieHeader: string | undefined, tokenName: string): string | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies[tokenName] || null;
  }
}
