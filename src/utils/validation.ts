import Joi from 'joi';
import { ValidationError } from './errors.js';

// Password validation - at least 8 characters, 1 uppercase, 1 lowercase, 1 number
const passwordSchema = Joi.string()
  .min(8)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  });

// Nigerian phone number validation
const phoneSchema = Joi.string()
  .pattern(new RegExp('^(\\+234|234|0)?[789][01]\\d{8}$'))
  .required()
  .messages({
    'string.pattern.base': 'Please provide a valid Nigerian phone number',
  });

export const registerValidation = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  phone: phoneSchema,
  password: passwordSchema,
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const menuItemValidation = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  price: Joi.number().positive().precision(2).required(),
  imageUrl: Joi.string().uri().optional(),
  isSpicy: Joi.boolean().default(false),
  isVegetarian: Joi.boolean().default(false),
  prepTime: Joi.number().integer().positive().max(180).optional(),
  categoryId: Joi.string().required(),
});

export const categoryValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).optional(),
  imageUrl: Joi.string().uri().optional(),
  sortOrder: Joi.number().integer().min(0).default(0),
});

export const orderValidation = Joi.object({
  type: Joi.string().valid('DELIVERY', 'PICKUP').required(),
  items: Joi.array().min(1).items(
    Joi.object({
      menuItemId: Joi.string().required(),
      quantity: Joi.number().integer().positive().max(10).required(),
      notes: Joi.string().max(200).optional(),
    })
  ).required(),
  customerName: Joi.string().min(2).max(100).required(),
  customerPhone: phoneSchema,
  customerEmail: Joi.string().email().required(),
  deliveryAddress: Joi.when('type', {
    is: 'DELIVERY',
    then: Joi.string().min(10).max(200).required(),
    otherwise: Joi.optional(),
  }),
  deliveryNotes: Joi.string().max(200).optional(),
  requestedTime: Joi.date().greater('now').optional(),
  paymentMethod: Joi.string().valid('stripe', 'transfer', 'cash').required(),
});

export const cateringInquiryValidation = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: phoneSchema,
  eventType: Joi.string().min(2).max(100).required(),
  eventDate: Joi.date().greater('now').required(),
  guestCount: Joi.number().integer().positive().max(1000).required(),
  location: Joi.string().min(5).max(200).required(),
  requirements: Joi.string().min(10).max(1000).required(),
  budget: Joi.number().positive().optional(),
});

export const reviewValidation = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(10).max(500).required(),
});

export const galleryValidation = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(200).optional(),
  imageUrl: Joi.string().uri().required(),
  category: Joi.string().valid('food', 'events', 'restaurant').required(),
  sortOrder: Joi.number().integer().min(0).default(0),
});

export function validateInput<T>(schema: Joi.ObjectSchema, input: unknown): T {
  const { error, value } = schema.validate(input, { abortEarly: false });
  
  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    throw new ValidationError(message);
  }
  
  return value as T;
}

export function validateObjectId(id: string, fieldName: string = 'ID'): void {
  // MongoDB ObjectId validation (24 character hex string)
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!objectIdPattern.test(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`);
  }
}