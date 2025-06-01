import { GraphQLError } from 'graphql';
export declare class AuthenticationError extends GraphQLError {
    constructor(message: string);
}
export declare class ForbiddenError extends GraphQLError {
    constructor(message: string);
}
export declare class ValidationError extends GraphQLError {
    constructor(message: string, field?: string);
}
export declare class NotFoundError extends GraphQLError {
    constructor(message: string);
}
export declare class ConflictError extends GraphQLError {
    constructor(message: string);
}
export declare class InternalServerError extends GraphQLError {
    constructor(message?: string);
}
