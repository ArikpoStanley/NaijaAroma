import Stripe from 'stripe';
import { InternalServerError, ValidationError } from '../utils/errors.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface PaymentIntentData {
  amount: number; // Amount in kobo (smallest currency unit)
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

export class PaymentService {
  /**
   * Create a payment intent for an order
   */
  static async createPaymentIntent(data: PaymentIntentData): Promise<PaymentResult> {
    try {
      // Convert amount to kobo (Stripe expects amounts in smallest currency unit)
      const amountInKobo = Math.round(data.amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInKobo,
        currency: data.currency || 'ngn', // Nigerian Naira
        // customer_email: data.customerEmail,
        description: data.description || `Payment for Order ${data.orderId}`,
        metadata: {
          orderId: data.orderId,
          customerName: data.customerName,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new InternalServerError('Failed to create payment intent');
    }
  }

  /**
   * Confirm a payment intent
   */
  static async confirmPaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      console.error('Failed to confirm payment intent:', error);
      return false;
    }
  }

  /**
   * Cancel a payment intent
   */
  static async cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
      await stripe.paymentIntents.cancel(paymentIntentId);
      return true;
    } catch (error) {
      console.error('Failed to cancel payment intent:', error);
      return false;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhookEvent(payload: string, signature: string): Promise<any> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new ValidationError('Webhook secret not configured');
    }

    try {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          // Handle successful payment
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment succeeded for order: ${paymentIntent.metadata.orderId}`);
          return { success: true, type: 'payment_succeeded', orderId: paymentIntent.metadata.orderId };

        case 'payment_intent.payment_failed':
          // Handle failed payment
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment failed for order: ${failedPayment.metadata.orderId}`);
          return { success: false, type: 'payment_failed', orderId: failedPayment.metadata.orderId };

        default:
          console.log(`Unhandled event type: ${event.type}`);
          return { success: true, type: 'unhandled' };
      }
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new ValidationError('Invalid webhook signature');
    }
  }

  /**
   * Calculate delivery fee based on order amount and location
   */
  static calculateDeliveryFee(orderAmount: number, location?: string): number {
    const freeDeliveryThreshold = parseFloat(process.env.FREE_DELIVERY_THRESHOLD || '5000');
    const defaultDeliveryFee = parseFloat(process.env.DEFAULT_DELIVERY_FEE || '500');

    // Free delivery for orders above threshold
    if (orderAmount >= freeDeliveryThreshold) {
      return 0;
    }

    // TODO: Implement location-based delivery fee calculation
    // For now, return default fee
    return defaultDeliveryFee;
  }

  /**
   * Generate receipt data
   */
  static generateReceiptData(order: any, paymentIntent: any) {
    return {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items,
      subtotal: order.totalAmount - (order.deliveryFee || 0),
      deliveryFee: order.deliveryFee || 0,
      total: order.totalAmount,
      paymentMethod: 'Card',
      paymentStatus: 'Paid',
      transactionId: paymentIntent.id,
      paidAt: new Date(),
    };
  }
}