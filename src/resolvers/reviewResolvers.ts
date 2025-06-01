import { AuthService, Context } from '../utils/auth.js';
import { validateInput, validateObjectId, reviewValidation } from '../utils/validation.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import prisma from '../utils/database.js';

interface CreateReviewInput {
  rating: number;
  comment: string;
}

export const reviewResolvers = {
  Query: {
    reviews: async (_: unknown, __: unknown, context: Context) => {
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

    review: async (_: unknown, { id }: { id: string }, context: Context) => {
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
    createReview: async (_: unknown, { input }: { input: CreateReviewInput }, context: Context) => {
      AuthService.requireAuth(context);
      
      const validatedInput = validateInput<CreateReviewInput>(reviewValidation, input);

      return prisma.review.create({
        data: {
          userId: context.user.id,
          rating: validatedInput.rating,
          comment: validatedInput.comment,
        },
      });
    },

    approveReview: async (_: unknown, { id }: { id: string }, context: Context) => {
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

    deleteReview: async (_: unknown, { id }: { id: string }, context: Context) => {
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
    user: async (parent: { userId: string }) => {
      return prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
  },
};