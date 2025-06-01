import { AuthService } from '../utils/auth.js';
import { NotFoundError } from '../utils/errors.js';
import prisma from '../utils/database.js';
export const settingsResolvers = {
    Query: {
        settings: async (_, __, context) => {
            AuthService.requireAdmin(context);
            return prisma.settings.findMany({
                orderBy: { key: 'asc' },
            });
        },
        setting: async (_, { key }) => {
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
        updateSetting: async (_, { key, value }, context) => {
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
