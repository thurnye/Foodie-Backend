/**
 * Swagger/OpenAPI specification for recipe-service
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Foodie Recipe Service API',
    version: '1.0.0',
    description: 'Recipe CRUD, reviews, and cookbook generation service for Foodie Blog',
  },
  servers: [
    {
      url: process.env.RECIPE_SERVICE_URL || 'https://api.example.com/recipe',
      description: 'Recipe service',
    },
  ],
  paths: {
    '/add/{userId}': {
      post: {
        summary: 'Create a new recipe',
        tags: ['Recipe'],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
      },
    },
    '/': {
      post: {
        summary: 'List recipes with filters and pagination',
        tags: ['Recipe'],
      },
    },
    '/query': {
      post: {
        summary: 'Advanced recipe search',
        tags: ['Recipe'],
      },
    },
    '/user/{userId}': {
      post: {
        summary: 'Get recipes by user',
        tags: ['Recipe'],
      },
    },
    '/{id}': {
      get: {
        summary: 'Get recipe by ID',
        tags: ['Recipe'],
      },
      patch: {
        summary: 'Update recipe',
        tags: ['Recipe'],
      },
      delete: {
        summary: 'Delete recipe',
        tags: ['Recipe'],
      },
    },
    '/review/recipe': {
      post: {
        summary: 'Add review to recipe',
        tags: ['Review'],
      },
    },
    '/generateCookBook/{userId}': {
      post: {
        summary: 'Generate cookbook PDF (stub)',
        tags: ['Cookbook'],
      },
    },
  },
};
