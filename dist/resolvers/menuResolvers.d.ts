import { Context } from '../utils/auth.js';
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
export declare const menuResolvers: {
    Query: {
        categories: () => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            isActive: boolean;
        }[]>;
        category: (_: unknown, { id }: {
            id: string;
        }) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            isActive: boolean;
        }>;
        menuItems: () => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            price: number;
            imageUrl: string | null;
            isSpicy: boolean;
            isVegetarian: boolean;
            prepTime: number | null;
            categoryId: string;
            isAvailable: boolean;
        }[]>;
        menuItem: (_: unknown, { id }: {
            id: string;
        }) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            price: number;
            imageUrl: string | null;
            isSpicy: boolean;
            isVegetarian: boolean;
            prepTime: number | null;
            categoryId: string;
            isAvailable: boolean;
        }>;
        menuItemsByCategory: (_: unknown, { categoryId }: {
            categoryId: string;
        }) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            price: number;
            imageUrl: string | null;
            isSpicy: boolean;
            isVegetarian: boolean;
            prepTime: number | null;
            categoryId: string;
            isAvailable: boolean;
        }[]>;
        availableMenuItems: () => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            price: number;
            imageUrl: string | null;
            isSpicy: boolean;
            isVegetarian: boolean;
            prepTime: number | null;
            categoryId: string;
            isAvailable: boolean;
        }[]>;
    };
    Mutation: {
        createCategory: (_: unknown, { input }: {
            input: CreateCategoryInput;
        }, context: Context) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            isActive: boolean;
        }>;
        updateCategory: (_: unknown, { id, input }: {
            id: string;
            input: UpdateCategoryInput;
        }, context: Context) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            isActive: boolean;
        }>;
        deleteCategory: (_: unknown, { id }: {
            id: string;
        }, context: Context) => Promise<boolean>;
        createMenuItem: (_: unknown, { input }: {
            input: CreateMenuItemInput;
        }, context: Context) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            price: number;
            imageUrl: string | null;
            isSpicy: boolean;
            isVegetarian: boolean;
            prepTime: number | null;
            categoryId: string;
            isAvailable: boolean;
        }>;
        updateMenuItem: (_: unknown, { id, input }: {
            id: string;
            input: UpdateMenuItemInput;
        }, context: Context) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            price: number;
            imageUrl: string | null;
            isSpicy: boolean;
            isVegetarian: boolean;
            prepTime: number | null;
            categoryId: string;
            isAvailable: boolean;
        }>;
        deleteMenuItem: (_: unknown, { id }: {
            id: string;
        }, context: Context) => Promise<boolean>;
    };
    Category: {
        menuItems: (parent: {
            id: string;
        }) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            price: number;
            imageUrl: string | null;
            isSpicy: boolean;
            isVegetarian: boolean;
            prepTime: number | null;
            categoryId: string;
            isAvailable: boolean;
        }[]>;
    };
    MenuItem: {
        category: (parent: {
            categoryId: string;
        }) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            isActive: boolean;
        } | null>;
    };
};
export {};
