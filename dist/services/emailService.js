import nodemailer from 'nodemailer';
export class EmailService {
    static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    /**
     * Send a generic email
     */
    static async sendEmail(options) {
        try {
            if (!process.env.SMTP_USER) {
                console.log('Email not configured, skipping send:', options.subject);
                return true; // Return true in development when email isn't configured
            }
            await this.transporter.sendMail({
                from: `"Naija Aroma" <${process.env.SMTP_USER}>`,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });
            console.log(`Email sent successfully to ${options.to}`);
            return true;
        }
        catch (error) {
            console.error('Failed to send email:', error);
            return false;
        }
    }
    /**
     * Send order confirmation email
     */
    static async sendOrderConfirmation(email, orderData) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e67e22; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-weight: bold; font-size: 1.2em; color: #e67e22; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Naija Aroma</h1>
            <h2>Order Confirmation</h2>
          </div>
          
          <div class="content">
            <p>Dear ${orderData.customerName},</p>
            <p>Thank you for your order! We're excited to prepare your delicious Nigerian meal.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
              ${orderData.estimatedTime ? `<p><strong>Estimated Ready Time:</strong> ${orderData.estimatedTime.toLocaleString()}</p>` : ''}
              ${orderData.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</p>` : ''}
              
              <h4>Items Ordered:</h4>
              ${orderData.items.map(item => `
                <div class="item">
                  <strong>${item.menuItem?.name || 'Item'}</strong> x ${item.quantity}<br>
                  <small>₦${item.price.toLocaleString()}</small>
                </div>
              `).join('')}
              
              <div class="total">
                <p>Total: ₦${orderData.totalAmount.toLocaleString()}</p>
              </div>
            </div>
            
            <p>We'll notify you when your order is ready. If you have any questions, please contact us:</p>
            <p>📞 ${process.env.WHATSAPP_PHONE_NUMBER || '+234 XXX XXX XXXX'}</p>
            <p>📧 info@naijaaroma.com</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing Naija Aroma!</p>
            <p>Taste the authentic flavors of Nigeria 🇳🇬</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return this.sendEmail({
            to: email,
            subject: `Order Confirmation - ${orderData.orderNumber}`,
            html,
        });
    }
    /**
     * Send order status update email
     */
    static async sendOrderStatusUpdate(email, orderNumber, status, customerName) {
        const statusMessages = {
            CONFIRMED: 'Your order has been confirmed and we are preparing it now!',
            PREPARING: 'Your order is being prepared by our chefs.',
            READY: 'Your order is ready for pickup/delivery!',
            DELIVERED: 'Your order has been delivered. Enjoy your meal!',
            CANCELLED: 'Your order has been cancelled. If you have any questions, please contact us.',
        };
        const message = statusMessages[status] || 'Your order status has been updated.';
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e67e22; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; text-align: center; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Naija Aroma</h1>
            <h2>Order Update</h2>
          </div>
          
          <div class="content">
            <p>Dear ${customerName},</p>
            
            <div class="status">
              <h3>Order ${orderNumber}</h3>
              <h2 style="color: #e67e22;">${status}</h2>
              <p>${message}</p>
            </div>
            
            <p>Thank you for your patience!</p>
          </div>
          
          <div class="footer">
            <p>Naija Aroma - Taste the authentic flavors of Nigeria 🇳🇬</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return this.sendEmail({
            to: email,
            subject: `Order Update - ${orderNumber} is ${status}`,
            html,
        });
    }
    /**
     * Send catering inquiry notification to admin
     */
    static async sendCateringInquiryNotification(inquiryData) {
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        if (!adminEmail) {
            console.log('Admin email not configured');
            return false;
        }
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Catering Inquiry</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e67e22; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .inquiry-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .field { margin: 10px 0; }
          .label { font-weight: bold; color: #e67e22; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Naija Aroma</h1>
            <h2>New Catering Inquiry</h2>
          </div>
          
          <div class="content">
            <p>You have received a new catering inquiry:</p>
            
            <div class="inquiry-details">
              <div class="field">
                <span class="label">Name:</span> ${inquiryData.name}
              </div>
              <div class="field">
                <span class="label">Email:</span> ${inquiryData.email}
              </div>
              <div class="field">
                <span class="label">Event Type:</span> ${inquiryData.eventType}
              </div>
              <div class="field">
                <span class="label">Event Date:</span> ${inquiryData.eventDate.toLocaleDateString()}
              </div>
              <div class="field">
                <span class="label">Guest Count:</span> ${inquiryData.guestCount}
              </div>
              <div class="field">
                <span class="label">Location:</span> ${inquiryData.location}
              </div>
              <div class="field">
                <span class="label">Requirements:</span><br>
                ${inquiryData.requirements}
              </div>
            </div>
            
            <p>Please respond to this inquiry promptly.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return this.sendEmail({
            to: adminEmail,
            subject: `New Catering Inquiry from ${inquiryData.name}`,
            html,
        });
    }
    /**
     * Send welcome email to new users
     */
    static async sendWelcomeEmail(email, username) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Naija Aroma</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e67e22; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .welcome { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; text-align: center; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Welcome to Naija Aroma!</h1>
          </div>
          
          <div class="content">
            <div class="welcome">
              <h2>Hello ${username}! 👋</h2>
              <p>Welcome to the Naija Aroma family! We're excited to serve you the most authentic Nigerian cuisine.</p>
              <p>You can now:</p>
              <ul style="text-align: left;">
                <li>Browse our delicious menu</li>
                <li>Place orders for delivery or pickup</li>
                <li>Request catering for your events</li>
                <li>Leave reviews and ratings</li>
              </ul>
            </div>
            
            <p>Start exploring our menu and taste the authentic flavors of Nigeria!</p>
          </div>
          
          <div class="footer">
            <p>Thank you for joining us!</p>
            <p>Naija Aroma - Taste the authentic flavors of Nigeria 🇳🇬</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return this.sendEmail({
            to: email,
            subject: 'Welcome to Naija Aroma! 🍽️',
            html,
        });
    }
}
