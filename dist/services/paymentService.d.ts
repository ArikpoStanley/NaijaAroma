export interface PaymentIntentData {
    amount: number;
    currency?: string;
    orderId: string;
    customerEmail: string;
    customerName: string;
    description?: string;
}
export interface PaymentResult {
    paymentIntentId: string;
    clientSecret: string;
    status: string;
}
export declare class PaymentService {
    /**
     * Create a payment intent for an order
     */
    static createPaymentIntent(data: PaymentIntentData): Promise<PaymentResult>;
    /**
     * Confirm a payment intent
     */
    static confirmPaymentIntent(paymentIntentId: string): Promise<boolean>;
    /**
     * Cancel a payment intent
     */
    static cancelPaymentIntent(paymentIntentId: string): Promise<boolean>;
    /**
     * Handle Stripe webhook events
     */
    static handleWebhookEvent(payload: string, signature: string): Promise<any>;
    /**
     * Calculate delivery fee based on order amount and location
     */
    static calculateDeliveryFee(orderAmount: number, location?: string): number;
    /**
     * Generate receipt data
     */
    static generateReceiptData(order: any, paymentIntent: any): {
        orderNumber: any;
        customerName: any;
        customerEmail: any;
        items: any;
        subtotal: number;
        deliveryFee: any;
        total: any;
        paymentMethod: string;
        paymentStatus: string;
        transactionId: any;
        paidAt: Date;
    };
}
