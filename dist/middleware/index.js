import express from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { upload, handleUploadError, getFileUrl } from '../utils/fileUpload.js';
// Security middleware
export const securityMiddleware = [
    // Helmet for security headers
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }),
    // Rate limiting
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: {
            error: 'Too many requests',
            message: 'Please try again later',
        },
        standardHeaders: true,
        legacyHeaders: false,
    }),
];
// File upload middleware
export const fileUploadMiddleware = (fieldName) => [
    upload.single(fieldName),
    handleUploadError,
];
// Static files middleware
export const staticFilesMiddleware = express.static(path.join(process.cwd(), process.env.UPLOAD_PATH || './uploads'), {
    maxAge: '1d', // Cache for 1 day
    etag: true,
});
// File upload routes
export const setupFileRoutes = (app) => {
    // Serve uploaded files
    app.use('/uploads', staticFilesMiddleware);
    // Upload endpoints
    app.post('/upload/menu', fileUploadMiddleware('menu'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                message: 'Please select a file to upload',
            });
        }
        const fileUrl = getFileUrl(req.file.filename, 'menu');
        res.json({
            success: true,
            fileUrl,
            filename: req.file.filename,
        });
    });
    app.post('/upload/gallery', fileUploadMiddleware('gallery'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                message: 'Please select a file to upload',
            });
        }
        const fileUrl = getFileUrl(req.file.filename, 'gallery');
        res.json({
            success: true,
            fileUrl,
            filename: req.file.filename,
        });
    });
    app.post('/upload/category', fileUploadMiddleware('category'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                message: 'Please select a file to upload',
            });
        }
        const fileUrl = getFileUrl(req.file.filename, 'categories');
        res.json({
            success: true,
            fileUrl,
            filename: req.file.filename,
        });
    });
};
