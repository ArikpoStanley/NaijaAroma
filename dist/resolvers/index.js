import { DateTimeResolver } from 'graphql-scalars';
import { authResolvers } from './authResolvers.js';
import { menuResolvers } from './menuResolvers.js';
import { orderResolvers } from './orderResolvers.js';
import { cateringResolvers } from './cateringResolvers.js';
import { reviewResolvers } from './reviewResolvers.js';
import { galleryResolvers } from './galleryResolvers.js';
import { settingsResolvers } from './settingsResolvers.js';
// Define the resolvers with explicit typing to avoid TypeScript inference issues
export const resolvers = {
    // Scalar types
    DateTime: DateTimeResolver,
    // Queries
    Query: {
        ...authResolvers.Query,
        ...menuResolvers.Query,
        ...orderResolvers.Query,
        ...cateringResolvers.Query,
        ...reviewResolvers.Query,
        ...galleryResolvers.Query,
        ...settingsResolvers.Query,
    },
    // Mutations
    Mutation: {
        ...authResolvers.Mutation,
        ...menuResolvers.Mutation,
        ...orderResolvers.Mutation,
        ...cateringResolvers.Mutation,
        ...reviewResolvers.Mutation,
        ...galleryResolvers.Mutation,
        ...settingsResolvers.Mutation,
    },
    // Type resolvers
    User: authResolvers.User,
    Category: menuResolvers.Category,
    MenuItem: menuResolvers.MenuItem,
    Order: orderResolvers.Order,
    OrderItem: orderResolvers.OrderItem,
    CateringInquiry: cateringResolvers.CateringInquiry,
    Review: reviewResolvers.Review,
};
