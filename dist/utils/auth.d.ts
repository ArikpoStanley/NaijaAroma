import { User } from '@prisma/client';
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
export declare class AuthService {
    private static get JWT_SECRET();
    private static readonly JWT_EXPIRES_IN;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hashedPassword: string): Promise<boolean>;
    static generateToken(payload: JWTPayload): string;
    static verifyToken(token: string): JWTPayload;
    static extractTokenFromHeader(authHeader?: string): string | null;
    static requireAuth(context: Context): asserts context is Context & {
        user: User;
    };
    static requireAdmin(context: Context): asserts context is Context & {
        user: User;
    };
    static generateOrderNumber(): string;
}
