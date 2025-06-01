import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ValidationError } from './errors.js';
// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subfolder = file.fieldname === 'menu' ? 'menu' :
            file.fieldname === 'gallery' ? 'gallery' :
                file.fieldname === 'category' ? 'categories' : 'misc';
        const fullPath = path.join(uploadDir, subfolder);
        // Create subfolder if it doesn't exist
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
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
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
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
// Helper function to delete file
export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    catch (error) {
        console.error('Error deleting file:', error);
    }
};
// Helper function to get file URL
export const getFileUrl = (filename, subfolder = 'misc') => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    return `${baseUrl}/uploads/${subfolder}/${filename}`;
};
// Middleware to handle upload errors
export const handleUploadError = (error, req, res, next) => {
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
