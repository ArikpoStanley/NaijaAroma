import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { upload, handleUploadError, getFileUrl } from '../utils/fileUpload.js';

// Check if we're in a serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

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
export const fileUploadMiddleware = (fieldName: string) => [
  upload.single(fieldName),
  handleUploadError,
];

// Static files middleware (only for non-serverless)
export const staticFilesMiddleware = !isServerless 
  ? express.static(
      path.join(process.cwd(), process.env.UPLOAD_PATH || './uploads'),
      {
        maxAge: '1d', // Cache for 1 day
        etag: true,
      }
    )
  : (req: Request, res: Response, next: NextFunction) => {
      res.status(501).json({
        error: 'File serving not available',
        message: 'Static file serving is not supported in serverless environment',
      });
    };

// File upload routes
export const setupFileRoutes = (app: express.Application) => {
  // Serve uploaded files (only in non-serverless environments)
  if (!isServerless) {
    app.use('/uploads', staticFilesMiddleware);
  } else {
    // In serverless, return a message about using cloud storage
    app.use('/uploads', (req: Request, res: Response) => {
      res.status(501).json({
        error: 'File uploads not available',
        message: 'File uploads require cloud storage in serverless environment. Please configure AWS S3, Cloudinary, or Vercel Blob.',
      });
    });
  }

  // Upload endpoints (disabled in serverless for now)
  if (!isServerless) {
    app.post('/upload/menu', 
      fileUploadMiddleware('menu'),
      (req: Request, res: Response) => {
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
      }
    );

    app.post('/upload/gallery', 
      fileUploadMiddleware('gallery'),
      (req: Request, res: Response) => {
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
      }
    );

    app.post('/upload/category', 
      fileUploadMiddleware('category'),
      (req: Request, res: Response) => {
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
      }
    );
  } else {
    // In serverless, provide endpoints that explain the limitation
    const uploadNotAvailable = (req: Request, res: Response) => {
      res.status(501).json({
        error: 'Upload not available',
        message: 'File uploads are not supported in serverless environment. Please use cloud storage like Cloudinary or AWS S3.',
        suggestion: 'Consider using Cloudinary or AWS S3 for file uploads in production.',
      });
    };

    app.post('/upload/menu', uploadNotAvailable);
    app.post('/upload/gallery', uploadNotAvailable);
    app.post('/upload/category', uploadNotAvailable);
  }
};