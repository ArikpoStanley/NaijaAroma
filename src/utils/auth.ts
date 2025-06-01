import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { AuthenticationError, ForbiddenError } from '../utils/errors.js';
import ms from 'ms';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface Context {
  user?: User;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export class AuthService {
  private static get JWT_SECRET(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  }

  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(payload: JWTPayload): string {
    const secret = this.JWT_SECRET;
     const options: SignOptions = {
    expiresIn: 60 * 60 * 24 * 7, 
  };
    
    return jwt.sign(payload, secret, options);
  }

  static verifyToken(token: string): JWTPayload {
    try {
      const secret = this.JWT_SECRET;
      const decoded = jwt.verify(token, secret);
      return decoded as JWTPayload;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  static requireAuth(context: Context): asserts context is Context & { user: User } {
    if (!context.isAuthenticated || !context.user) {
      throw new AuthenticationError('Authentication required');
    }
  }

  static requireAdmin(context: Context): asserts context is Context & { user: User } {
    this.requireAuth(context);
    if (!context.isAdmin) {
      throw new ForbiddenError('Admin access required');
    }
  }

  static generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `NA-${timestamp}-${randomStr}`.toUpperCase();
  }
}