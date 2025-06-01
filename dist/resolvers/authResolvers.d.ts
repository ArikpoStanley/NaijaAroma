import { Context } from '../utils/auth.js';
interface RegisterInput {
    email: string;
    username: string;
    phone: string;
    password: string;
}
interface LoginInput {
    email: string;
    password: string;
}
export declare const authResolvers: {
    Query: {
        me: (_: unknown, __: unknown, context: Context) => Promise<{
            id: string;
            email: string;
            username: string;
            phone: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        }>;
        users: (_: unknown, __: unknown, context: Context) => Promise<{
            id: string;
            email: string;
            username: string;
            phone: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[]>;
    };
    Mutation: {
        register: (_: unknown, { input }: {
            input: RegisterInput;
        }) => Promise<{
            token: string;
            user: {
                password: undefined;
                id: string;
                email: string;
                username: string;
                phone: string;
                role: import(".prisma/client").$Enums.UserRole;
                isVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        }>;
        login: (_: unknown, { input }: {
            input: LoginInput;
        }) => Promise<{
            token: string;
            user: {
                password: undefined;
                id: string;
                email: string;
                username: string;
                phone: string;
                role: import(".prisma/client").$Enums.UserRole;
                isVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        }>;
    };
    User: {
        orders: (parent: {
            id: string;
        }) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerPhone: string;
            type: import(".prisma/client").$Enums.OrderType;
            customerName: string;
            customerEmail: string;
            deliveryAddress: string | null;
            deliveryNotes: string | null;
            requestedTime: Date | null;
            paymentMethod: string | null;
            orderNumber: string;
            userId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            totalAmount: number;
            deliveryFee: number | null;
            paymentStatus: string;
            stripePaymentId: string | null;
            estimatedTime: Date | null;
            deliveredAt: Date | null;
        }[]>;
        reviews: (parent: {
            id: string;
        }) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            comment: string;
            userId: string;
            isApproved: boolean;
        }[]>;
    };
};
export {};
