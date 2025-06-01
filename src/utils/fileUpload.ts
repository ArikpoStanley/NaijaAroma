import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ValidationError } from './errors.js';

// Check if we're in a serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Ensure upload directory exists (only in non-serverless environments)
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!isServerless && !fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (error) {
    console.warn('Could not create uploads directory:', error);
  }
}

// Configure storage based on environment
const storage = isServerless 
  ? multer.memoryStorage() // Use memory storage for serverless
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const subfolder = file.fieldname === 'menu' ? 'menu' : 
                         file.fieldname === 'gallery' ? 'gallery' : 
                         file.fieldname === 'category' ? 'categories' : 'misc';
        
        const fullPath = path.join(uploadDir, subfolder);
        
        // Create subfolder if it doesn't exist
        if (!fs.existsSync(fullPath)) {
          try {
            fs.mkdirSync(fullPath, { recursive: true });
          } catch (error) {
            console.warn('Could not create subfolder:', error);
          }
        }
        
        cb(null, fullPath);
      },
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
      },
    });

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Only JPEG, PNG, and WebP images are allowed'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
    files: 1, // Single file upload
  },
});

// Helper function to delete file (only works in non-serverless)
export const deleteFile = (filePath: string): void => {
  if (isServerless) {
    console.warn('File deletion not supported in serverless environment');
    return;
  }

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Helper function to get file URL
export const getFileUrl = (filename: string, subfolder: string = 'misc'): string => {
  const baseUrl = process.env.BASE_URL || process.env.VERCEL_URL || 'http://localhost:4000';
  return `${baseUrl}/uploads/${subfolder}/${filename}`;
};

// Middleware to handle upload errors
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 5MB',
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field',
        message: 'Only one file is allowed',
      });
    }
  }
  
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message,
    });
  }
  
  next(error);
};