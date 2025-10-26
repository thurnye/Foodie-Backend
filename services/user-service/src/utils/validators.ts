import Joi from 'joi';

/**
 * Create profile validation schema
 */
export const createProfileSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().optional().trim(),
  lastName: Joi.string().optional().trim(),
  username: Joi.string().alphanum().min(3).max(30).optional().trim(),
});

/**
 * Edit profile validation schema
 */
export const editProfileSchema = Joi.object({
  firstName: Joi.string().optional().trim(),
  lastName: Joi.string().optional().trim(),
  username: Joi.string().alphanum().min(3).max(30).optional().trim(),
  bio: Joi.string().max(500).optional().trim(),
  avatar: Joi.string().uri().optional(),
}).min(1); // At least one field must be provided
