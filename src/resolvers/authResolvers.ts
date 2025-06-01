import { AuthService, Context } from '../utils/auth.js';
import { validateInput, registerValidation, loginValidation } from '../utils/validation.js';
import { ConflictError, AuthenticationError } from '../utils/errors.js';
import prisma from '../utils/database.js';

interface RegisterInput {
  email: string;
  username: string;
  phone: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      AuthService.requireAuth(context);
      return context.user;
    },

    users: async (_: unknown, __: unknown, context: Context) => {
      AuthService.requireAdmin(context);
      return prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Mutation: {
    register: async (_: unknown, { input }: { input: RegisterInput }) => {
      // Validate input
      const validatedInput = validateInput<RegisterInput>(registerValidation, input);

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

    login: async (_: unknown, { input }: { input: LoginInput }) => {
      // Validate input
      const validatedInput = validateInput<LoginInput>(loginValidation, input);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: validatedInput.email },
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await AuthService.comparePassword(
        validatedInput.password,
        user.password
      );

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
    orders: async (parent: { id: string }) => {
      return prisma.order.findMany({
        where: { userId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },

    reviews: async (parent: { id: string }) => {
      return prisma.review.findMany({
        where: { userId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
};