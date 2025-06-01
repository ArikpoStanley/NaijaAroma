import { AuthService } from '../utils/auth.js';
import { validateInput, registerValidation, loginValidation } from '../utils/validation.js';
import { ConflictError, AuthenticationError } from '../utils/errors.js';
import prisma from '../utils/database.js';
export const authResolvers = {
    Query: {
        me: async (_, __, context) => {
            AuthService.requireAuth(context);
            return context.user;
        },
        users: async (_, __, context) => {
            AuthService.requireAdmin(context);
            return prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
            });
        },
    },
    Mutation: {
        register: async (_, { input }) => {
            // Validate input
            const validatedInput = validateInput(registerValidation, input);
            // Check if user already exists
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: validatedInput.email },
                        { username: validatedInput.username },
                    ],
                },
            });
            if (existingUser) {
                if (existingUser.email === validatedInput.email) {
                    throw new ConflictError('Email already registered');
                }
                throw new ConflictError('Username already taken');
            }
            // Hash password
            const hashedPassword = await AuthService.hashPassword(validatedInput.password);
            // Create user
            const user = await prisma.user.create({
                data: {
                    email: validatedInput.email,
                    username: validatedInput.username,
                    phone: validatedInput.phone,
                    password: hashedPassword,
                },
            });
            // Generate token
            const token = AuthService.generateToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            return {
                token,
                user: {
                    ...user,
                    password: undefined, // Remove password from response
                },
            };
        },
        login: async (_, { input }) => {
            // Validate input
            const validatedInput = validateInput(loginValidation, input);
            // Find user
            const user = await prisma.user.findUnique({
                where: { email: validatedInput.email },
            });
            if (!user) {
                throw new AuthenticationError('Invalid email or password');
            }
            // Verify password
            const isValidPassword = await AuthService.comparePassword(validatedInput.password, user.password);
            if (!isValidPassword) {
                throw new AuthenticationError('Invalid email or password');
            }
            // Generate token
            const token = AuthService.generateToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            return {
                token,
                user: {
                    ...user,
                    password: undefined, // Remove password from response
                },
            };
        },
    },
    User: {
        orders: async (parent) => {
            return prisma.order.findMany({
                where: { userId: parent.id },
                orderBy: { createdAt: 'desc' },
            });
        },
        reviews: async (parent) => {
            return prisma.review.findMany({
                where: { userId: parent.id },
                orderBy: { createdAt: 'desc' },
            });
        },
    },
};
