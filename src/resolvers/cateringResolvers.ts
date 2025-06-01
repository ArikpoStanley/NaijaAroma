import { AuthService, Context } from '../utils/auth.js';
import { validateInput, validateObjectId, cateringInquiryValidation } from '../utils/validation.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import prisma from '../utils/database.js';

interface CreateCateringInquiryInput {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: Date;
  guestCount: number;
  location: string;
  requirements: string;
  budget?: number;
}

export const cateringResolvers = {
  Query: {
    cateringInquiries: async (_: unknown, __: unknown, context: Context) => {
      AuthService.requireAuth(context);

      if (context.isAdmin) {
        return prisma.cateringInquiry.findMany({
          orderBy: { createdAt: 'desc' },
        });
      }

      return prisma.cateringInquiry.findMany({
        where: { 
          OR: [
            { userId: context.user.id },
            { email: context.user.email },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    cateringInquiry: async (_: unknown, { id }: { id: string }, context: Context) => {
      AuthService.requireAuth(context);
      validateObjectId(id, 'Catering inquiry ID');

      const inquiry = await prisma.cateringInquiry.findUnique({
        where: { id },
      });

      if (!inquiry) {
        throw new NotFoundError('Catering inquiry not found');
      }

      // Check if user can access this inquiry
      if (!context.isAdmin && inquiry.userId !== context.user.id && inquiry.email !== context.user.email) {
        throw new ForbiddenError('Access denied');
      }

      return inquiry;
    },
  },

  Mutation: {
    createCateringInquiry: async (_: unknown, { input }: { input: CreateCateringInquiryInput }, context: Context) => {
      const validatedInput = validateInput<CreateCateringInquiryInput>(cateringInquiryValidation, input);

      const inquiryData: any = {
        name: validatedInput.name,
        email: validatedInput.email,
        phone: validatedInput.phone,
        eventType: validatedInput.eventType,
        eventDate: validatedInput.eventDate,
        guestCount: validatedInput.guestCount,
        location: validatedInput.location,
        requirements: validatedInput.requirements,
        budget: validatedInput.budget,
      };

      // If user is authenticated, link the inquiry to them
      if (context.isAuthenticated && context.user) {
        inquiryData.userId = context.user.id;
      }

      return prisma.cateringInquiry.create({
        data: inquiryData,
      });
    },

    updateCateringStatus: async (
      _: unknown,
      { 
        id, 
        status, 
        quotedAmount, 
        notes 
      }: { 
        id: string; 
        status: 'INQUIRY' | 'QUOTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
        quotedAmount?: number;
        notes?: string;
      },
      context: Context
    ) => {
      AuthService.requireAdmin(context);
      validateObjectId(id, 'Catering inquiry ID');

      const inquiry = await prisma.cateringInquiry.findUnique({
        where: { id },
      });

      if (!inquiry) {
        throw new NotFoundError('Catering inquiry not found');
      }

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (quotedAmount !== undefined) {
        updateData.quotedAmount = quotedAmount;
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      return prisma.cateringInquiry.update({
        where: { id },
        data: updateData,
      });
    },
  },

  CateringInquiry: {
    user: async (parent: { userId?: string }) => {
      if (!parent.userId) return null;
      
      return prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
  },
};