import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticationError, ForbiddenError } from '../utils/errors.js';
export class AuthService {
    static get JWT_SECRET() {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET environment variable is required');
        }
        return secret;
    }
    static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
    static async hashPassword(password) {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    }
    static async comparePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
    static generateToken(payload) {
        const secret = this.JWT_SECRET;
        const options = {
            expiresIn: 60 * 60 * 24 * 7,
        };
        return jwt.sign(payload, secret, options);
    }
    static verifyToken(token) {
        try {
            const secret = this.JWT_SECRET;
            const decoded = jwt.verify(token, secret);
            return decoded;
        }
        catch (error) {
            throw new AuthenticationError('Invalid or expired token');
        }
    }
    static extractTokenFromHeader(authHeader) {
        if (!authHeader)
            return null;
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }
        return parts[1];
    }
    static requireAuth(context) {
        if (!context.isAuthenticated || !context.user) {
            throw new AuthenticationError('Authentication required');
        }
    }
    static requireAdmin(context) {
        this.requireAuth(context);
        if (!context.isAdmin) {
            throw new ForbiddenError('Admin access required');
        }
    }
    static generateOrderNumber() {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `NA-${timestamp}-${randomStr}`.toUpperCase();
    }
}
