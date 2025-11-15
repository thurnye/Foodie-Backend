import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

/**
 * Generic validation middleware factory
 */
export const validate = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  };
};

/**
 * Custom color schema for cookbook customization
 */
const customColorsSchema = Joi.object({
  primary: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondary: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  accent: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
}).optional();

/**
 * Create cookbook validation schema
 */
export const createCookbookSchema = Joi.object({
  title: Joi.string().required().trim().min(1).max(200),
  description: Joi.string().trim().max(1000).optional(),
  recipes: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(0).max(100).optional(),
  theme: Joi.string().valid('modern', 'classic', 'rustic', 'minimalist', 'elegant').optional(),
  layout: Joi.string().valid('single-column', 'two-column', 'magazine').optional(),
  coverImage: Joi.string().uri().optional(),
  customColors: customColorsSchema,
  authorBio: Joi.string().trim().max(2000).optional(),
  authorImage: Joi.string().uri().optional(),
  isPublic: Joi.boolean().optional(),
});

/**
 * Update cookbook validation schema
 */
export const updateCookbookSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().max(1000).optional(),
  recipes: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(0).max(100).optional(),
  theme: Joi.string().valid('modern', 'classic', 'rustic', 'minimalist', 'elegant').optional(),
  layout: Joi.string().valid('single-column', 'two-column', 'magazine').optional(),
  coverImage: Joi.string().uri().optional(),
  customColors: customColorsSchema,
  authorBio: Joi.string().trim().max(2000).optional(),
  authorImage: Joi.string().uri().optional(),
  isPublic: Joi.boolean().optional(),
}).min(1);

/**
 * Query cookbooks validation schema
 */
export const queryCookbooksSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('draft', 'generating', 'completed', 'failed').optional(),
  isPublic: Joi.boolean().optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'title').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});
