import { AuthService } from '../utils/auth.js';
import { validateInput, validateObjectId, reviewValidation } from '../utils/validation.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import prisma from '../utils/database.js';
export const reviewResolvers = {
    Query: {
        reviews: async (_, __, context) => {
            AuthService.requireAdmin(context);
            return prisma.review.findMany({
                orderBy: { createdAt: 'desc' },
            });
        },
        approvedReviews: async () => {
            return prisma.review.findMany({
                where: { isApproved: true },
                orderBy: { createdAt: 'desc' },
            });
        },
        review: async (_, { id }, context) => {
            validateObjectId(id, 'Review ID');
            const review = await prisma.review.findUnique({
                where: { id },
            });
            if (!review) {
                throw new NotFoundError('Review not found');
            }
            // Only admin or review owner can see unapproved reviews
            if (!review.isApproved) {
                if (!context.isAuthenticated) {
                    throw new ForbiddenError('Access denied');
                }
                if (!context.isAdmin && review.userId !== context.user?.id) {
                    throw new ForbiddenError('Access denied');
                }
            }
            return review;
        },
    },
    Mutation: {
        createReview: async (_, { input }, context) => {
            AuthService.requireAuth(context);
            const validatedInput = validateInput(reviewValidation, input);
            return prisma.review.create({
                data: {
                    userId: context.user.id,
                    rating: validatedInput.rating,
                    comment: validatedInput.comment,
                },
            });
        },
        approveReview: async (_, { id }, context) => {
            AuthService.requireAdmin(context);
            validateObjectId(id, 'Review ID');
            const review = await prisma.review.findUnique({
                where: { id },
            });
            if (!review) {
                throw new NotFoundError('Review not found');
            }
            return prisma.review.update({
                where: { id },
                data: { isApproved: true },
            });
        },
        deleteReview: async (_, { id }, context) => {
            AuthService.requireAdmin(context);
            validateObjectId(id, 'Review ID');
            const review = await prisma.review.findUnique({
                where: { id },
            });
            if (!review) {
                throw new NotFoundError('Review not found');
            }
            await prisma.review.delete({
                where: { id },
            });
            return true;
        },
    },
    Review: {
        user: async (parent) => {
            return prisma.user.findUnique({
                where: { id: parent.userId },
            });
        },
    },
};
