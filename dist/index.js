import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { typeDefs } from './schema/index.js';
import { resolvers } from './resolvers/index.js';
import { createContext } from './context.js';
import { securityMiddleware, setupFileRoutes } from './middleware/index.js';
import { PaymentService } from './services/paymentService.js';
import prisma from './utils/database.js';
// Load environment variables
dotenv.config();
async function startServer() {
    // Create Express app
    const app = express();
    // Apply security middleware
    app.use(securityMiddleware);
    // Create HTTP server
    const httpServer = http.createServer(app);
    // Create Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        formatError: (err) => {
            // Log error for debugging
            console.error('GraphQL Error:', err);
            // Return formatted error
            return {
                message: err.message,
                code: err.extensions?.code,
                path: err.path,
                locations: err.locations,
            };
        },
        introspection: true, // Enable introspection
        includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
    });
    // Start Apollo Server
    await server.start();
    // Configure CORS
    const corsOptions = {
        origin: process.env.NODE_ENV === 'production'
            ? process.env.FRONTEND_URL || false
            : ['http://localhost:3000', 'http://localhost:3001', 'https://studio.apollographql.com'],
        credentials: true,
    };
    // Apply GraphQL middleware
    app.use('/graphql', cors(corsOptions), express.json({ limit: '10mb' }), expressMiddleware(server, {
        context: createContext,
    }));
    // GraphQL Playground (Development Only)
    if (process.env.NODE_ENV !== 'production') {
        app.get('/playground', (req, res) => {
            res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset=utf-8/>
          <meta name="viewport" content="user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, minimal-ui">
          <title>GraphQL Playground</title>
          <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css" />
          <link rel="shortcut icon" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/favicon.png" />
          <script src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/js/middleware.js"></script>
        </head>
        <body>
          <div id="root">
            <style>
              body {
                background-color: rgb(23, 42, 58);
                font-family: Open Sans, sans-serif;
                height: 90vh;
              }
              #root {
                height: 100%;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .loading {
                font-size: 32px;
                font-weight: 200;
                color: rgba(255, 255, 255, .6);
                margin-left: 20px;
              }
              img {
                width: 78px;
                height: 78px;
              }
              .title {
                font-weight: 400;
              }
            </style>
            <img src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/logo.png" alt="">
            <div class="loading"> Loading
              <span class="title">GraphQL Playground</span>
            </div>
          </div>
          <script>window.addEventListener('load', function (event) {
              GraphQLPlayground.init(document.getElementById('root'), {
                endpoint: '/graphql',
                settings: {
                  'editor.theme': 'dark',
                  'editor.fontSize': 14,
                  'editor.fontFamily': '"Source Code Pro", "Consolas", "Inconsolata", "Droid Sans Mono", "Monaco", monospace',
                  'request.credentials': 'include',
                }
              })
            })</script>
        </body>
        </html>
      `);
        });
    }
    // Setup file upload routes
    setupFileRoutes(app);
    // Stripe webhook endpoint (must be before express.json middleware for /webhook/stripe)
    app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
        try {
            const sig = req.headers['stripe-signature'];
            const event = await PaymentService.handleWebhookEvent(req.body, sig);
            // Handle the event (update order status, send emails, etc.)
            if (event.type === 'payment_succeeded') {
                // Update order payment status
                await prisma.order.update({
                    where: { orderNumber: event.orderId },
                    data: { paymentStatus: 'paid' },
                });
            }
            res.json({ received: true });
        }
        catch (error) {
            console.error('Webhook error:', error);
            res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
        });
    });
    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            name: 'Naija Aroma GraphQL API',
            version: '1.0.0',
            description: 'Nigerian restaurant and catering service API',
            endpoints: {
                graphql: '/graphql',
                playground: process.env.NODE_ENV !== 'production' ? '/playground' : null,
                health: '/health',
                uploads: '/uploads',
                webhook: '/webhook/stripe',
            },
            documentation: 'Visit /playground for GraphQL Playground (development only)',
        });
    });
    // 404 handler
    app.use('*', (req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: 'The requested endpoint does not exist',
            path: req.originalUrl,
        });
    });
    // Global error handler
    app.use((error, req, res, next) => {
        console.error('Unhandled error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'production'
                ? 'Something went wrong'
                : error.message,
        });
    });
    // Test database connection
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
    // Start server
    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
        console.log('\n🚀 Naija Aroma Backend Server Started!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🌐 Server: http://localhost:${PORT}`);
        console.log(`🔗 GraphQL: http://localhost:${PORT}/graphql`);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`🎮 Playground: http://localhost:${PORT}/playground`);
        }
        console.log(`📊 Health: http://localhost:${PORT}/health`);
        console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
        console.log(`💳 Webhook: http://localhost:${PORT}/webhook/stripe`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        if (process.env.NODE_ENV !== 'production') {
            console.log('💡 Development Tips:');
            console.log('  • Run "npm run db:seed" to populate with sample data');
            console.log('  • Visit /playground for GraphQL Playground');
            console.log('  • Visit /graphql for Apollo Studio connection');
            console.log('  • Check .env.example for required environment variables\n');
        }
    });
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
        console.log(`\n📋 Received ${signal}. Starting graceful shutdown...`);
        try {
            await new Promise((resolve) => httpServer.close(resolve));
            await server.stop();
            await prisma.$disconnect();
            console.log('✅ Graceful shutdown completed');
            process.exit(0);
        }
        catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    };
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}
// Start the server
startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
