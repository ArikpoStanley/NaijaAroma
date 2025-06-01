import { AuthService, Context } from './utils/auth.js';
import prisma from './utils/database.js';

interface ContextInput {
  req: {
    headers: {
      authorization?: string;
    };
  };
}

export async function createContext({ req }: ContextInput): Promise<Context> {
  const context: Context = {
    user: undefined,
    isAuthenticated: false,
    isAdmin: false,
  };

  try {
    // Extract token from Authorization header
    const token = AuthService.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      // Verify and decode token
      const payload = AuthService.verifyToken(token);
      
      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (user) {
        context.user = user;
        context.isAuthenticated = true;
        context.isAdmin = user.role === 'ADMIN';
      }
    }
  } catch (error) {
    // Token is invalid or expired, continue with unauthenticated context
    console.warn('Authentication failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  return context;
}