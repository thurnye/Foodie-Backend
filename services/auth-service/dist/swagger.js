"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
exports.swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Foodie Auth Service API',
        version: '1.0.0',
        description: 'Authentication and authorization service for Foodie Blog',
    },
    servers: [
        {
            url: process.env.AUTH_SERVICE_URL || 'https://api.example.com/auth',
            description: 'Auth service',
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
    },
};
//# sourceMappingURL=swagger.js.map