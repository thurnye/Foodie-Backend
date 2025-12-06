import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { fail } from './response';

/**
 * Joi validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Remove fields not in schema
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      // console.log('Validation error:', errorMessage);
      fail(res, errorMessage, 422);
      return;
    }

    req.body = value;
    next();
  };
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),

  objectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid ID format',
    }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

/**
 * Optional fields used across profile validation
 */
export const optionalUserFields = {
  firstName: Joi.string().optional().trim().messages({
    'string.base': 'First name must be a valid string',
  }),

  lastName: Joi.string().optional().trim().messages({
    'string.base': 'Last name must be a valid string',
  }),

  username: Joi.string().alphanum().min(3).max(30).optional().trim().messages({
    'string.alphanum': 'Username must contain only letters and numbers',
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username cannot exceed 30 characters',
  }),

  bio: Joi.string().max(500).optional().trim().messages({
    'string.max': 'Bio cannot exceed 500 characters',
  }),

  avatar: Joi.string().uri().optional().messages({
    'string.uri': 'Avatar must be a valid URL',
  }),

  dateOfBirth: Joi.string().optional(),
  gender: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  postalCode: Joi.string().optional(),
  slogan: Joi.string().optional().trim(),
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitize = (input: string): string => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};
