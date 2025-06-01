import express from 'express';
export declare const securityMiddleware: (((req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void) | import("express-rate-limit").RateLimitRequestHandler)[];
export declare const fileUploadMiddleware: (fieldName: string) => (((error: any, req: any, res: any, next: any) => any) | express.RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>)[];
export declare const staticFilesMiddleware: import("serve-static").RequestHandler<express.Response<any, Record<string, any>>>;
export declare const setupFileRoutes: (app: express.Application) => void;
