import Joi from 'joi';

const valueLabelSchema = Joi.object({
  value: Joi.string().required(),
  label: Joi.string().required(),
});

const contentBlockSchema = Joi.object({
  type: Joi.string().valid('text', 'image', 'video', 'title').required(),
  value: Joi.any().required(),
  isUnsplash: Joi.boolean().optional(),
  isMultiple: Joi.boolean().optional(),
});

const nutritionalFactSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.string().required(),
  unit: Joi.string().required(),
});

const faqSchema = Joi.object({
  ques: Joi.string().optional(),
  ans: Joi.string().optional(),
});

const ingredientSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('main', 'dressing').required(),
});

const methodSchema = Joi.object({
  step: Joi.array().items(contentBlockSchema).min(1),
});

/**
 * Add/Update recipe validation schema (unified)
 * If _id is provided, it's an update; otherwise, it's a create
 */
export const addRecipeSchema = Joi.object({
  _id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(), // Optional MongoDB ObjectId for updates

  basicInfo: Joi.object({
    recipeName: Joi.string().required().trim(),
    duration: valueLabelSchema.required(),
    level: valueLabelSchema.required(),
    serving: valueLabelSchema.required(),
    tags: Joi.array().items(valueLabelSchema).min(1),
    categories: Joi.array().items(valueLabelSchema).min(1),
  }).required(),

  details: Joi.object({
    thumbnail: Joi.string().required(),
    about: Joi.array().items(contentBlockSchema).min(1),
    faqs: Joi.array().items(faqSchema).optional(),
  }).required(),

  nutritionalFacts: Joi.array().items(nutritionalFactSchema).optional(),

  directions: Joi.object({
    methods: Joi.array().items(methodSchema).min(1),
    ingredients: Joi.array().items(ingredientSchema).min(1),
  }).required(),
});

/**
 * Update recipe validation schema (partial)
 */
export const updateRecipeSchema = Joi.object({
  basicInfo: Joi.object({
    recipeName: Joi.string().trim().optional(),
    duration: valueLabelSchema.optional(),
    level: valueLabelSchema.optional(),
    serving: valueLabelSchema.optional(),
    tags: Joi.array().items(valueLabelSchema).optional(),
    categories: Joi.array().items(valueLabelSchema).optional(),
  }).optional(),

  details: Joi.object({
    thumbnail: Joi.string().optional(),
    about: Joi.array().items(contentBlockSchema).optional(),
    faqs: Joi.array().items(faqSchema).optional(),
  }).optional(),

  nutritionalFacts: Joi.array().items(nutritionalFactSchema).optional(),

  directions: Joi.object({
    methods: Joi.array().items(methodSchema).optional(),
    ingredients: Joi.array().items(ingredientSchema).optional(),
  }).optional(),
}).min(1);

/**
 * List/Query recipes validation schema
 */
export const queryRecipesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
  categories: Joi.alternatives().try(
    Joi.string().allow(''),
    Joi.array().items(Joi.string())
  ).optional(),
  tags: Joi.alternatives().try(
    Joi.string().allow(''),
    Joi.array().items(Joi.string())
  ).optional(),
  level: Joi.string().allow('').optional(),
  minRating: Joi.number().min(0).max(5).optional(),
  sortBy: Joi.string().valid('createdAt', 'averageRating', 'recipeName').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

/**
 * Add review validation schema
 */
export const addReviewSchema = Joi.object({
  review: Joi.string().required().trim().min(10).max(1000),
  rating: Joi.number().required().min(1).max(5).integer(),
  recipeId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
});

/**
 * Update review validation schema
 */
export const updateReviewSchema = Joi.object({
  review: Joi.string().trim().min(10).max(1000).optional(),
  rating: Joi.number().min(1).max(5).integer().optional(),
}).min(1);
