import { AuthService } from '../utils/auth.js';
import { validateInput, validateObjectId, galleryValidation } from '../utils/validation.js';
import { NotFoundError } from '../utils/errors.js';
import prisma from '../utils/database.js';
export const galleryResolvers = {
    Query: {
        galleryItems: async () => {
            return prisma.gallery.findMany({
                where: { isActive: true },
                orderBy: [
                    { sortOrder: 'asc' },
                    { createdAt: 'desc' },
                ],
            });
        },
        galleryItem: async (_, { id }) => {
            validateObjectId(id, 'Gallery item ID');
            const galleryItem = await prisma.gallery.findUnique({
                where: { id },
            });
            if (!galleryItem) {
                throw new NotFoundError('Gallery item not found');
            }
            return galleryItem;
        },
        galleryByCategory: async (_, { category }) => {
            return prisma.gallery.findMany({
                where: {
                    category,
                    isActive: true,
                },
                orderBy: [
                    { sortOrder: 'asc' },
                    { createdAt: 'desc' },
                ],
            });
        },
    },
    Mutation: {
        createGalleryItem: async (_, { input }, context) => {
            AuthService.requireAdmin(context);
            const validatedInput = validateInput(galleryValidation, input);
            return prisma.gallery.create({
                data: validatedInput,
            });
        },
        updateGalleryItem: async (_, { id, input }, context) => {
            AuthService.requireAdmin(context);
            validateObjectId(id, 'Gallery item ID');
            const galleryItem = await prisma.gallery.findUnique({
                where: { id },
            });
            if (!galleryItem) {
                throw new NotFoundError('Gallery item not found');
            }
            return prisma.gallery.update({
                where: { id },
                data: input,
            });
        },
        deleteGalleryItem: async (_, { id }, context) => {
            AuthService.requireAdmin(context);
            validateObjectId(id, 'Gallery item ID');
            const galleryItem = await prisma.gallery.findUnique({
                where: { id },
            });
            if (!galleryItem) {
                throw new NotFoundError('Gallery item not found');
            }
            await prisma.gallery.delete({
                where: { id },
            });
            return true;
        },
    },
};
