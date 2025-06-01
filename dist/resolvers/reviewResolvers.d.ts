import { Context } from '../utils/auth.js';
interface CreateReviewInput {
    rating: number;
    comment: string;
}
export declare const reviewResolvers: {
    Query: {
        reviews: (_: unknown, __: unknown, context: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            comment: string;
            userId: string;
            isApproved: boolean;
        }[]>;
        approvedReviews: () => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            comment: string;
            userId: string;
            isApproved: boolean;
        }[]>;
        review: (_: unknown, { id }: {
            id: string;
        }, context: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            comment: string;
            userId: string;
            isApproved: boolean;
        }>;
    };
    Mutation: {
        createReview: (_: unknown, { input }: {
            input: CreateReviewInput;
        }, context: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            comment: string;
            userId: string;
            isApproved: boolean;
        }>;
        approveReview: (_: unknown, { id }: {
            id: string;
        }, context: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            comment: string;
            userId: string;
            isApproved: boolean;
        }>;
        deleteReview: (_: unknown, { id }: {
            id: string;
        }, context: Context) => Promise<boolean>;
    };
    Review: {
        user: (parent: {
            userId: string;
        }) => Promise<{
            id: string;
            email: string;
            username: string;
            phone: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null>;
    };
};
export {};
