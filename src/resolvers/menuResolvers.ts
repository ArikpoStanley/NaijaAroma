import { AuthService, Context } from '../utils/auth.js';
import { validateInput, validateObjectId, categoryValidation, menuItemValidation } from '../utils/validation.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import prisma from '../utils/database.js';

interface CreateCategoryInput {
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
}

interface UpdateCategoryInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

interface CreateMenuItemInput {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  prepTime?: number;
  categoryId: string;
}

interface UpdateMenuItemInput {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  prepTime?: number;
  categoryId?: string;
}

export const menuResolvers = {
  Query: {
    categories: async () => {
      return prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    },

    category: async (_: unknown, { id }: { id: string }) => {
      validateObjectId(id, 'Category ID');
      
      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      return category;
    },

    menuItems: async () => {
      return prisma.menuItem.findMany({
        orderBy: { createdAt: 'desc' },
      });
    },

    menuItem: async (_: unknown, { id }: { id: string }) => {
      validateObjectId(id, 'Menu item ID');
      
      const menuItem = await prisma.menuItem.findUnique({
        where: { id },
      });

      if (!menuItem) {
        throw new NotFoundError('Menu item not found');
      }

      return menuItem;
    },

    menuItemsByCategory: async (_: unknown, { categoryId }: { categoryId: string }) => {
      validateObjectId(categoryId, 'Category ID');
      
      return prisma.menuItem.findMany({
        where: { 
          categoryId,
          isAvailable: true,
        },
        orderBy: { name: 'asc' },
      });
    },

    availableMenuItems: async () => {
      return prisma.menuItem.findMany({
        where: { isAvailable: true },
        orderBy: { name: 'asc' },
      });
    },
  },

  Mutation: {
    createCategory: async (_: unknown, { input }: { input: CreateCategoryInput }, context: Context) => {
      AuthService.requireAdmin(context);
      
      const validatedInput = validateInput<CreateCategoryInput>(categoryValidation, input);

      // Check if category name already exists
      const existingCategory = await prisma.category.findUnique({
        where: { name: validatedInput.name },
      });

      if (existingCategory) {
        throw new ConflictError('Category name already exists');
      }

      return prisma.category.create({
        data: validatedInput,
      });
    },

    updateCategory: async (_: unknown, { id, input }: { id: string; input: UpdateCategoryInput }, context: Context) => {
      AuthService.requireAdmin(context);
      validateObjectId(id, 'Category ID');

      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      // If updating name, check for conflicts
      if (input.name && input.name !== category.name) {
        const existingCategory = await prisma.category.findUnique({
          where: { name: input.name },
        });

        if (existingCategory) {
          throw new ConflictError('Category name already exists');
        }
      }

      return prisma.category.update({
        where: { id },
        data: input,
      });
    },

    deleteCategory: async (_: unknown, { id }: { id: string }, context: Context) => {
      AuthService.requireAdmin(context);
      validateObjectId(id, 'Category ID');

      const category = await prisma.category.findUnique({
        where: { id },
        include: { menuItems: true },
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      // Check if category has menu items
      if (category.menuItems.length > 0) {
        throw new ConflictError('Cannot delete category with existing menu items');
      }

      await prisma.category.delete({
        where: { id },
      });

      return true;
    },

    createMenuItem: async (_: unknown, { input }: { input: CreateMenuItemInput }, context: Context) => {
      AuthService.requireAdmin(context);
      
      const validatedInput = validateInput<CreateMenuItemInput>(menuItemValidation, input);
      validateObjectId(validatedInput.categoryId, 'Category ID');

      // Verify category exists
      const category = await prisma.category.findUnique({
        where: { id: validatedInput.categoryId },
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      return prisma.menuItem.create({
        data: validatedInput,
      });
    },

    updateMenuItem: async (_: unknown, { id, input }: { id: string; input: UpdateMenuItemInput }, context: Context) => {
      AuthService.requireAdmin(context);
      validateObjectId(id, 'Menu item ID');

      const menuItem = await prisma.menuItem.findUnique({
        where: { id },
      });

      if (!menuItem) {
        throw new NotFoundError('Menu item not found');
      }

      // If updating categoryId, verify it exists
      if (input.categoryId) {
        validateObjectId(input.categoryId, 'Category ID');
        
        const category = await prisma.category.findUnique({
          where: { id: input.categoryId },
        });

        if (!category) {
          throw new NotFoundError('Category not found');
        }
      }

      return prisma.menuItem.update({
        where: { id },
        data: input,
      });
    },

    deleteMenuItem: async (_: unknown, { id }: { id: string }, context: Context) => {
      AuthService.requireAdmin(context);
      validateObjectId(id, 'Menu item ID');

      const menuItem = await prisma.menuItem.findUnique({
        where: { id },
      });

      if (!menuItem) {
        throw new NotFoundError('Menu item not found');
      }

      await prisma.menuItem.delete({
        where: { id },
      });

      return true;
    },
  },

  Category: {
    menuItems: async (parent: { id: string }) => {
      return prisma.menuItem.findMany({
        where: { categoryId: parent.id },
        orderBy: { name: 'asc' },
      });
    },
  },

  MenuItem: {
    category: async (parent: { categoryId: string }) => {
      return prisma.category.findUnique({
        where: { id: parent.categoryId },
      });
    },
  },
};