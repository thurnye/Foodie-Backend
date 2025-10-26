"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
exports.swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Foodie User Service API',
        version: '1.0.0',
        description: 'User profile management service for Foodie Blog',
    },
    servers: [
        {
            url: 'http://localhost:3002',
            description: 'Development server',
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
    },
};
//# sourceMappingURL=swagger.js.map