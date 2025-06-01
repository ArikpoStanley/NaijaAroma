import { Context } from '../utils/auth.js';
interface OrderItemInput {
    menuItemId: string;
    quantity: number;
    notes?: string;
}
interface CreateOrderInput {
    type: 'DELIVERY' | 'PICKUP';
    items: OrderItemInput[];
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryAddress?: string;
    deliveryNotes?: string;
    requestedTime?: Date;
    paymentMethod: string;
}
interface UpdateOrderStatusInput {
    status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    estimatedTime?: Date;
}
export declare const orderResolvers: {
    Query: {
        orders: (_: unknown, __: unknown, context: Context) => Promise<{
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
        order: (_: unknown, { id }: {
            id: string;
        }, context: Context) => Promise<{
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
        }>;
        orderByNumber: (_: unknown, { orderNumber }: {
            orderNumber: string;
        }, context: Context) => Promise<{
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
        }>;
    };
    Mutation: {
        createOrder: (_: unknown, { input }: {
            input: CreateOrderInput;
        }, context: Context) => Promise<{
            items: {
                id: string;
                createdAt: Date;
                price: number;
                menuItemId: string;
                quantity: number;
                notes: string | null;
                orderId: string;
            }[];
        } & {
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
        }>;
        updateOrderStatus: (_: unknown, { id, input }: {
            id: string;
            input: UpdateOrderStatusInput;
        }, context: Context) => Promise<{
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
        }>;
        cancelOrder: (_: unknown, { id }: {
            id: string;
        }, context: Context) => Promise<{
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
        }>;
    };
    Order: {
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
        items: (parent: {
            id: string;
        }) => Promise<{
            id: string;
            createdAt: Date;
            price: number;
            menuItemId: string;
            quantity: number;
            notes: string | null;
            orderId: string;
        }[]>;
    };
    OrderItem: {
        menuItem: (parent: {
            menuItemId: string;
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
        } | null>;
    };
};
export {};
