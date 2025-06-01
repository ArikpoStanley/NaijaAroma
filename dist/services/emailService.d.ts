interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
interface OrderEmailData {
    orderNumber: string;
    customerName: string;
    items: any[];
    totalAmount: number;
    deliveryAddress?: string;
    estimatedTime?: Date;
}
interface CateringEmailData {
    name: string;
    email: string;
    eventType: string;
    eventDate: Date;
    guestCount: number;
    location: string;
    requirements: string;
}
export declare class EmailService {
    private static transporter;
    /**
     * Send a generic email
     */
    static sendEmail(options: EmailOptions): Promise<boolean>;
    /**
     * Send order confirmation email
     */
    static sendOrderConfirmation(email: string, orderData: OrderEmailData): Promise<boolean>;
    /**
     * Send order status update email
     */
    static sendOrderStatusUpdate(email: string, orderNumber: string, status: string, customerName: string): Promise<boolean>;
    /**
     * Send catering inquiry notification to admin
     */
    static sendCateringInquiryNotification(inquiryData: CateringEmailData): Promise<boolean>;
    /**
     * Send welcome email to new users
     */
    static sendWelcomeEmail(email: string, username: string): Promise<boolean>;
}
export {};
