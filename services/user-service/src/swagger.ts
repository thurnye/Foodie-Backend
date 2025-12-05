/**
 * Swagger/OpenAPI specification for user-service
 * TODO: Implement full Swagger documentation
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Foodie User Service API',
    version: '1.0.0',
    description: 'User profile management service for Foodie Blog',
  },
  servers: [
    {
      url: process.env.USER_SERVICE_URL || 'https://api.example.com/user',
      description: 'User service',
    },
  ],
  paths: {
    '/create': {
      post: {
        summary: 'Create a new user profile',
        tags: ['User'],
      },
    },
    '/edit': {
      post: {
        summary: 'Update user profile',
        tags: ['User'],
      },
    },
    '/{id}': {
      get: {
        summary: 'Get user profile by ID',
        tags: ['User'],
      },
    },
    // TODO: Add more endpoints
  },
};
