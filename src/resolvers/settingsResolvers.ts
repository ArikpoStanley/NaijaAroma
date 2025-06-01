import { AuthService, Context } from '../utils/auth.js';
import { NotFoundError } from '../utils/errors.js';
import prisma from '../utils/database.js';

export const settingsResolvers = {
  Query: {
    settings: async (_: unknown, __: unknown, context: Context) => {
      AuthService.requireAdmin(context);
      
      return prisma.settings.findMany({
        orderBy: { key: 'asc' },
      });
    },

    setting: async (_: unknown, { key }: { key: string }) => {
      const setting = await prisma.settings.findUnique({
        where: { key },
      });

      if (!setting) {
        throw new NotFoundError('Setting not found');
      }

      return setting;
    },
  },

  Mutation: {
    updateSetting: async (_: unknown, { key, value }: { key: string; value: string }, context: Context) => {
      AuthService.requireAdmin(context);

      return prisma.settings.upsert({
        where: { key },
        update: { 
          value,
          updatedAt: new Date(),
        },
        create: { 
          key,
          value,
        },
      });
    },
  },
};