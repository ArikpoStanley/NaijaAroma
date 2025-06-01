import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
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
// Create Express app
const app = express();
let server;
let isServerInitialized = false;
async function initializeServer() {
    if (isServerInitialized)
        return;
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');
        // Apply security middleware
        app.use(securityMiddleware);
        // Create Apollo Server
        server = new ApolloServer({
            typeDefs,
            resolvers,
            formatError: (err) => {
                console.error('GraphQL Error:', err);
                return {
                    message: err.message,
                    code: err.extensions?.code,
                    path: err.path,
                    locations: err.locations,
                };
            },
            introspection: true,
            includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
        });
        // Start Apollo Server
        await server.start();
        // Configure CORS
        const corsOptions = {
            origin: process.env.NODE_ENV === 'production'
                ? [process.env.FRONTEND_URL, 'https://studio.apollographql.com'].filter((url) => Boolean(url))
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
                body { background-color: rgb(23, 42, 58); font-family: Open Sans, sans-serif; height: 90vh; }
                #root { height: 100%; width: 100%; display: flex; align-items: center; justify-content: center; }
                .loading { font-size: 32px; font-weight: 200; color: rgba(255, 255, 255, .6); margin-left: 20px; }
                img { width: 78px; height: 78px; }
                .title { font-weight: 400; }
              </style>
              <img src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/logo.png" alt="">
              <div class="loading"> Loading <span class="title">GraphQL Playground</span> </div>
            </div>
            <script>window.addEventListener('load', function (event) {
                GraphQLPlayground.init(document.getElementById('root'), {
                  endpoint: '/graphql',
                  settings: { 'editor.theme': 'dark', 'editor.fontSize': 14, 'request.credentials': 'include' }
                })
              })</script>
          </body>
          </html>
        `);
            });
        }
        // Setup file upload routes
        setupFileRoutes(app);
        // Stripe webhook endpoint
        app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
            try {
                const sig = req.headers['stripe-signature'];
                const event = await PaymentService.handleWebhookEvent(req.body, sig);
                if (event.type === 'payment_succeeded') {
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
                version: '1.0.0',
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
                documentation: 'Visit /graphql for GraphQL endpoint',
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
        isServerInitialized = true;
        console.log('🚀 Server initialized successfully');
    }
    catch (error) {
        console.error('❌ Server initialization failed:', error);
        throw error;
    }
}
// For local development
async function startLocalServer() {
    await initializeServer();
    const httpServer = http.createServer(app);
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
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
        console.log(`\n📋 Received ${signal}. Starting graceful shutdown...`);
        try {
            httpServer.close();
            if (server)
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
// For Vercel serverless deployment
export default async function handler(req, res) {
    await initializeServer();
    return app(req, res);
}
// Start local server if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    startLocalServer().catch((error) => {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    });
}
