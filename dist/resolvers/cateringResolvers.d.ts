import { Context } from '../utils/auth.js';
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
export declare const cateringResolvers: {
    Query: {
        cateringInquiries: (_: unknown, __: unknown, context: Context) => Promise<{
            name: string;
            id: string;
            email: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            eventType: string;
            eventDate: Date;
            guestCount: number;
            location: string;
            requirements: string;
            budget: number | null;
            userId: string | null;
            status: import(".prisma/client").$Enums.CateringStatus;
            quotedAmount: number | null;
        }[]>;
        cateringInquiry: (_: unknown, { id }: {
            id: string;
        }, context: Context) => Promise<{
            name: string;
            id: string;
            email: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            eventType: string;
            eventDate: Date;
            guestCount: number;
            location: string;
            requirements: string;
            budget: number | null;
            userId: string | null;
            status: import(".prisma/client").$Enums.CateringStatus;
            quotedAmount: number | null;
        }>;
    };
    Mutation: {
        createCateringInquiry: (_: unknown, { input }: {
            input: CreateCateringInquiryInput;
        }, context: Context) => Promise<{
            name: string;
            id: string;
            email: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            eventType: string;
            eventDate: Date;
            guestCount: number;
            location: string;
            requirements: string;
            budget: number | null;
            userId: string | null;
            status: import(".prisma/client").$Enums.CateringStatus;
            quotedAmount: number | null;
        }>;
        updateCateringStatus: (_: unknown, { id, status, quotedAmount, notes }: {
            id: string;
            status: "INQUIRY" | "QUOTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
            quotedAmount?: number;
            notes?: string;
        }, context: Context) => Promise<{
            name: string;
            id: string;
            email: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            eventType: string;
            eventDate: Date;
            guestCount: number;
            location: string;
            requirements: string;
            budget: number | null;
            userId: string | null;
            status: import(".prisma/client").$Enums.CateringStatus;
            quotedAmount: number | null;
        }>;
    };
    CateringInquiry: {
        user: (parent: {
            userId?: string;
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
