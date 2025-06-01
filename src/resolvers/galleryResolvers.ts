import { AuthService, Context } from '../utils/auth.js';
import { validateInput, validateObjectId, galleryValidation } from '../utils/validation.js';
import { NotFoundError } from '../utils/errors.js';
import prisma from '../utils/database.js';

interface CreateGalleryInput {
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  sortOrder?: number;
}

interface UpdateGalleryInput {
  title?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  isActive?: boolean;
  sortOrder?: number;
}

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

    galleryItem: async (_: unknown, { id }: { id: string }) => {
      validateObjectId(id, 'Gallery item ID');
      
      const galleryItem = await prisma.gallery.findUnique({
        where: { id },
      });

      if (!galleryItem) {
        throw new NotFoundError('Gallery item not found');
      }

      return galleryItem;
    },

    galleryByCategory: async (_: unknown, { category }: { category: string }) => {
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
    createGalleryItem: async (_: unknown, { input }: { input: CreateGalleryInput }, context: Context) => {
      AuthService.requireAdmin(context);
      
      const validatedInput = validateInput<CreateGalleryInput>(galleryValidation, input);

      return prisma.gallery.create({
        data: validatedInput,
      });
    },

    updateGalleryItem: async (_: unknown, { id, input }: { id: string; input: UpdateGalleryInput }, context: Context) => {
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

    deleteGalleryItem: async (_: unknown, { id }: { id: string }, context: Context) => {
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