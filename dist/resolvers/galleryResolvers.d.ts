import { Context } from '../utils/auth.js';
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
export declare const galleryResolvers: {
    Query: {
        galleryItems: () => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            description: string | null;
            imageUrl: string;
            sortOrder: number;
            title: string;
            isActive: boolean;
        }[]>;
        galleryItem: (_: unknown, { id }: {
            id: string;
        }) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            description: string | null;
            imageUrl: string;
            sortOrder: number;
            title: string;
            isActive: boolean;
        }>;
        galleryByCategory: (_: unknown, { category }: {
            category: string;
        }) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            description: string | null;
            imageUrl: string;
            sortOrder: number;
            title: string;
            isActive: boolean;
        }[]>;
    };
    Mutation: {
        createGalleryItem: (_: unknown, { input }: {
            input: CreateGalleryInput;
        }, context: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            description: string | null;
            imageUrl: string;
            sortOrder: number;
            title: string;
            isActive: boolean;
        }>;
        updateGalleryItem: (_: unknown, { id, input }: {
            id: string;
            input: UpdateGalleryInput;
        }, context: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            description: string | null;
            imageUrl: string;
            sortOrder: number;
            title: string;
            isActive: boolean;
        }>;
        deleteGalleryItem: (_: unknown, { id }: {
            id: string;
        }, context: Context) => Promise<boolean>;
    };
};
export {};
