/**
 * Aggregated Swagger documentation for Foodie Backend API Gateway
 */
import swaggerUi from 'swagger-ui-express';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Foodie Backend API',
    version: '1.0.0',
    description: 'API Gateway for Foodie Blog - aggregates all microservices',
    contact: {
      name: 'Foodie API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Development API Gateway',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'Auth service endpoints' },
    { name: 'User', description: 'User service endpoints' },
    { name: 'Recipe', description: 'Recipe service endpoints' },
    { name: 'Review', description: 'Review endpoints' },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'User registered successfully' },
          '400': { description: 'Validation error' },
          '409': { description: 'User already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/user/{id}': {
      get: {
        summary: 'Get user profile',
        tags: ['User'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'User profile retrieved' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/recipe': {
      post: {
        summary: 'List recipes with filters and pagination',
        tags: ['Recipe'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  page: { type: 'number', default: 1 },
                  limit: { type: 'number', default: 12 },
                  categories: { type: 'array', items: { type: 'string' } },
                  tags: { type: 'array', items: { type: 'string' } },
                  minRating: { type: 'number', minimum: 0, maximum: 5 },
                  sortBy: { type: 'string', enum: ['createdAt', 'averageRating', 'recipeName'] },
                  sortOrder: { type: 'string', enum: ['asc', 'desc'] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Recipes retrieved successfully' },
        },
      },
    },
    '/api/recipe/{id}': {
      get: {
        summary: 'Get recipe by ID',
        tags: ['Recipe'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Recipe retrieved' },
          '404': { description: 'Recipe not found' },
        },
      },
    },
    '/api/review/recipe': {
      post: {
        summary: 'Add review to recipe',
        tags: ['Review'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  recipeId: { type: 'string' },
                  review: { type: 'string' },
                  rating: { type: 'number', minimum: 1, maximum: 5 },
                },
                required: ['recipeId', 'review', 'rating'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Review added successfully' },
          '401': { description: 'Unauthorized' },
          '409': { description: 'Review already exists' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

// Export swagger-ui-express setup
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
});

export const swaggerUiServe = swaggerUi.serve;
