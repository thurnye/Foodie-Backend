/**
 * Swagger/OpenAPI specification for auth-service
 * TODO: Implement full Swagger documentation
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Foodie Auth Service API',
    version: '1.0.0',
    description: 'Authentication and authorization service for Foodie Blog',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
  ],
  paths: {
    '/register': {
      post: {
        summary: 'Register a new user',
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
                  username: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
      },
    },
    '/login': {
      post: {
        summary: 'Login user',
        tags: ['Authentication'],
      },
    },
    '/me': {
      get: {
        summary: 'get Current user',
        tags: ['Authentication'],
      },
    },
    // TODO: Add more endpoints
  },
};
