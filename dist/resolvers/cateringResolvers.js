import { AuthService } from '../utils/auth.js';
import { validateInput, validateObjectId, cateringInquiryValidation } from '../utils/validation.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import prisma from '../utils/database.js';
export const cateringResolvers = {
    Query: {
        cateringInquiries: async (_, __, context) => {
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
        cateringInquiry: async (_, { id }, context) => {
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
        createCateringInquiry: async (_, { input }, context) => {
            const validatedInput = validateInput(cateringInquiryValidation, input);
            const inquiryData = {
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
        updateCateringStatus: async (_, { id, status, quotedAmount, notes }, context) => {
            AuthService.requireAdmin(context);
            validateObjectId(id, 'Catering inquiry ID');
            const inquiry = await prisma.cateringInquiry.findUnique({
                where: { id },
            });
            if (!inquiry) {
                throw new NotFoundError('Catering inquiry not found');
            }
            const updateData = {
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
        user: async (parent) => {
            if (!parent.userId)
                return null;
            return prisma.user.findUnique({
                where: { id: parent.userId },
            });
        },
    },
};
