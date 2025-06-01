import multer from 'multer';
export declare const upload: multer.Multer;
export declare const deleteFile: (filePath: string) => void;
export declare const getFileUrl: (filename: string, subfolder?: string) => string;
export declare const handleUploadError: (error: any, req: any, res: any, next: any) => any;
