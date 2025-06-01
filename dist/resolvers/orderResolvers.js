import { AuthService } from '../utils/auth.js';
import { validateInput, validateObjectId, orderValidation } from '../utils/validation.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';
import prisma from '../utils/database.js';
export const orderResolvers = {
    Query: {
        orders: async (_, __, context) => {
            AuthService.requireAuth(context);
            if (context.isAdmin) {
                return prisma.order.findMany({
                    orderBy: { createdAt: 'desc' },
                });
            }
            return prisma.order.findMany({
                where: { userId: context.user.id },
                orderBy: { createdAt: 'desc' },
            });
        },
        order: async (_, { id }, context) => {
            AuthService.requireAuth(context);
            validateObjectId(id, 'Order ID');
            const order = await prisma.order.findUnique({
                where: { id },
            });
            if (!order) {
                throw new NotFoundError('Order not found');
            }
            // Check if user can access this order
            if (!context.isAdmin && order.userId !== context.user.id) {
                throw new ForbiddenError('Access denied');
            }
            return order;
        },
        orderByNumber: async (_, { orderNumber }, context) => {
            AuthService.requireAuth(context);
            const order = await prisma.order.findUnique({
                where: { orderNumber },
            });
            if (!order) {
                throw new NotFoundError('Order not found');
            }
            // Check if user can access this order
            if (!context.isAdmin && order.userId !== context.user.id) {
                throw new ForbiddenError('Access denied');
            }
            return order;
        },
    },
    Mutation: {
        createOrder: async (_, { input }, context) => {
            AuthService.requireAuth(context);
            const validatedInput = validateInput(orderValidation, input);
            // Validate and fetch menu items
            const menuItemIds = validatedInput.items.map(item => {
                validateObjectId(item.menuItemId, 'Menu item ID');
                return item.menuItemId;
            });
            const menuItems = await prisma.menuItem.findMany({
                where: {
                    id: { in: menuItemIds },
                    isAvailable: true,
                },
            });
            if (menuItems.length !== menuItemIds.length) {
                throw new ValidationError('One or more menu items are not available');
            }
            // Calculate total amount
            let totalAmount = 0;
            const orderItems = validatedInput.items.map(item => {
                const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                if (!menuItem) {
                    throw new ValidationError(`Menu item ${item.menuItemId} not found`);
                }
                const itemTotal = menuItem.price * item.quantity;
                totalAmount += itemTotal;
                return {
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    price: menuItem.price,
                    notes: item.notes,
                };
            });
            // Calculate delivery fee
            let deliveryFee = 0;
            if (validatedInput.type === 'DELIVERY') {
                const freeDeliveryThreshold = parseFloat(process.env.FREE_DELIVERY_THRESHOLD || '5000');
                const defaultDeliveryFee = parseFloat(process.env.DEFAULT_DELIVERY_FEE || '500');
                if (totalAmount < freeDeliveryThreshold) {
                    deliveryFee = defaultDeliveryFee;
                }
            }
            const finalTotal = totalAmount + deliveryFee;
            // Create order with items
            const order = await prisma.order.create({
                data: {
                    orderNumber: AuthService.generateOrderNumber(),
                    userId: context.user.id,
                    type: validatedInput.type,
                    totalAmount: finalTotal,
                    deliveryFee: deliveryFee > 0 ? deliveryFee : null,
                    customerName: validatedInput.customerName,
                    customerPhone: validatedInput.customerPhone,
                    customerEmail: validatedInput.customerEmail,
                    deliveryAddress: validatedInput.deliveryAddress,
                    deliveryNotes: validatedInput.deliveryNotes,
                    requestedTime: validatedInput.requestedTime,
                    paymentMethod: validatedInput.paymentMethod,
                    items: {
                        create: orderItems,
                    },
                },
                include: {
                    items: true,
                },
            });
            return order;
        },
        updateOrderStatus: async (_, { id, input }, context) => {
            AuthService.requireAdmin(context);
            validateObjectId(id, 'Order ID');
            const order = await prisma.order.findUnique({
                where: { id },
            });
            if (!order) {
                throw new NotFoundError('Order not found');
            }
            const updateData = {
                status: input.status,
                updatedAt: new Date(),
            };
            if (input.estimatedTime) {
                updateData.estimatedTime = input.estimatedTime;
            }
            if (input.status === 'DELIVERED') {
                updateData.deliveredAt = new Date();
            }
            return prisma.order.update({
                where: { id },
                data: updateData,
            });
        },
        cancelOrder: async (_, { id }, context) => {
            AuthService.requireAuth(context);
            validateObjectId(id, 'Order ID');
            const order = await prisma.order.findUnique({
                where: { id },
            });
            if (!order) {
                throw new NotFoundError('Order not found');
            }
            // Check if user can cancel this order
            if (!context.isAdmin && order.userId !== context.user.id) {
                throw new ForbiddenError('Access denied');
            }
            // Check if order can be cancelled
            if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
                throw new ValidationError('Order cannot be cancelled');
            }
            return prisma.order.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });
        },
    },
    Order: {
        user: async (parent) => {
            return prisma.user.findUnique({
                where: { id: parent.userId },
            });
        },
        items: async (parent) => {
            return prisma.orderItem.findMany({
                where: { orderId: parent.id },
                orderBy: { createdAt: 'asc' },
            });
        },
    },
    OrderItem: {
        menuItem: async (parent) => {
            return prisma.menuItem.findUnique({
                where: { id: parent.menuItemId },
            });
        },
    },
};
