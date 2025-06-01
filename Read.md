# 🍽️ Naija Aroma Backend

A comprehensive GraphQL backend for Naija Aroma, a Nigerian restaurant and catering business. Built with TypeScript, Node.js, GraphQL, MongoDB, and Prisma.

## 🚀 Features

### Core Functionality
- **🔐 Authentication & Authorization** - JWT-based auth with role-based access control
- **🍽️ Menu Management** - Complete CRUD operations for categories and menu items
- **📦 Order Management** - Full order lifecycle from creation to delivery
- **🎉 Catering Services** - Inquiry system for event catering
- **⭐ Reviews & Ratings** - Customer feedback system with admin moderation
- **🖼️ Gallery Management** - Image gallery for food, events, and restaurant photos
- **⚙️ Settings Management** - Configurable restaurant settings

### Security Features
- **Password Hashing** - bcryptjs with salt rounds
- **Input Validation** - Joi validation schemas
- **Rate Limiting** - Express rate limiting
- **CORS Protection** - Configurable CORS policies
- **Helmet Security** - Security headers middleware
- **Error Handling** - Comprehensive error management

### Payment Integration
- **💳 Stripe Integration** - Secure payment processing
- **📧 Email Notifications** - Order confirmations and updates
- **🔔 Webhook Support** - Real-time payment status updates

### File Management
- **📁 File Uploads** - Image upload for menu items, gallery, and categories
- **🖼️ Image Optimization** - File size and type validation
- **📂 Organized Storage** - Categorized file storage structure

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **GraphQL**: Apollo Server
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT
- **Payments**: Stripe
- **Email**: Nodemailer
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, Rate Limiting

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd naija-aroma-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the following environment variables:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/naija_aroma"
# For MongoDB Atlas: "mongodb+srv://username:password@cluster.mongodb.net/naija_aroma?retryWrites=true&w=majority"

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@naijaaroma.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Business Settings
DEFAULT_DELIVERY_FEE=500
FREE_DELIVERY_THRESHOLD=5000
WHATSAPP_PHONE_NUMBER=+2348000000000
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for MongoDB)
npx prisma db push

# Seed with sample data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

The server will be available at:
- **API**: http://localhost:4000
- **GraphQL Playground**: http://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health

## 🔧 Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run compile      # Compile TypeScript
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations (for SQL databases)
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data

# Utilities
npm run clean        # Clean build directory
```

## 📡 API Documentation

### GraphQL Endpoints

The API provides a single GraphQL endpoint at `/graphql` with the following main operations:

#### Authentication
```graphql
# Register new user
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user { id email username role }
  }
}

# Login
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user { id email username role }
  }
}
```

#### Menu Management
```graphql
# Get all categories
query Categories {
  categories {
    id name description imageUrl menuItems { id name price }
  }
}

# Get available menu items
query MenuItems {
  availableMenuItems {
    id name description price imageUrl isSpicy isVegetarian category { name }
  }
}
```

#### Order Management
```graphql
# Create order
mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    id orderNumber totalAmount status items { menuItem { name } quantity }
  }
}

# Get user orders
query Orders {
  orders {
    id orderNumber status totalAmount createdAt items { menuItem { name } quantity }
  }
}
```

### REST Endpoints

#### File Upload
- **POST** `/upload/menu` - Upload menu item images
- **POST** `/upload/gallery` - Upload gallery images  
- **POST** `/upload/category` - Upload category images

#### Static Files
- **GET** `/uploads/*` - Serve uploaded files

#### Webhooks
- **POST** `/webhook/stripe` - Stripe payment webhooks

#### Health & Info
- **GET** `/health` - Health check
- **GET** `/` - API information

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **CUSTOMER** - Can place orders, leave reviews, create catering inquiries
- **ADMIN** - Full access to all operations including menu management

### Default Accounts (after seeding)
- **Admin**: `admin@naijaaroma.com` / `Admin123!`
- **Customer**: `customer@test.com` / `Customer123!`

## 💳 Payment Integration

### Stripe Setup
1. Create a Stripe account
2. Get your API keys from the Stripe Dashboard
3. Set up webhook endpoint for payment events
4. Configure environment variables

### Supported Currencies
- NGN (Nigerian Naira) - Default
- USD (US Dollar)

## 📧 Email Notifications

Configure SMTP settings to enable:
- Order confirmations
- Order status updates
- Catering inquiry notifications
- Welcome emails for new users

## 📁 File Storage

Files are organized in the following structure:
```
uploads/
├── menu/           # Menu item images
├── gallery/        # Gallery images
├── categories/     # Category images
└── misc/          # Other files
```

### File Upload Limits
- **Max Size**: 5MB
- **Formats**: JPEG, PNG, WebP
- **Single file per upload**

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=<production-mongodb-url>
JWT_SECRET=<strong-secret-key>
STRIPE_SECRET_KEY=<live-stripe-key>
FRONTEND_URL=<your-frontend-domain>
```

### Build for Production
```bash
npm run compile
npm start
```

### Database Migration
For production deployment:
```bash
npx prisma db push
npm run db:seed  # Optional: seed with initial data
```

## 🔧 Configuration

### Business Settings
Key settings configurable via GraphQL mutations (Admin only):

- `delivery_fee` - Default delivery fee
- `free_delivery_threshold` - Free delivery minimum order
- `restaurant_open_time` / `restaurant_close_time` - Operating hours
- `max_delivery_distance` - Delivery radius
- `whatsapp_number` - WhatsApp contact

### Security Configuration
- JWT expiration time
- Rate limiting rules
- CORS allowed origins
- File upload restrictions

## 📊 Database Schema

### Main Entities
- **Users** - Customer and admin accounts
- **Categories** - Menu item categories
- **MenuItems** - Restaurant menu items
- **Orders** - Customer orders with items
- **CateringInquiries** - Event catering requests
- **Reviews** - Customer reviews and ratings
- **Gallery** - Restaurant and food images
- **Settings** - Configurable system settings

### Relationships
- Users → Orders (one-to-many)
- Users → Reviews (one-to-many)
- Categories → MenuItems (one-to-many)
- Orders → OrderItems (one-to-many)
- MenuItems → OrderItems (one-to-many)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token format in requests
   - Ensure token hasn't expired

3. **File Upload Errors**
   - Check file size limits
   - Verify upload directory permissions
   - Ensure file type is supported

4. **Email Not Sending**
   - Verify SMTP configuration
   - Check email provider settings
   - Test with a simple email first

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:
- **Email**: info@naijaaroma.com
- **WhatsApp**: +234 XXX XXX XXXX

---

**Built with ❤️ for authentic Nigerian cuisine** 🇳🇬