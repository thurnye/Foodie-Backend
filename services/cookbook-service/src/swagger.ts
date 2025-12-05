/**
 * Swagger/OpenAPI specification for cookbook-service
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Foodie Cookbook Service API',
    version: '1.0.0',
    description: 'Cookbook and Book management service for Foodie Blog',
  },
  servers: [
    {
      url: process.env.COOKBOOK_SERVICE_URL || 'https://api.example.com/cookbook',
      description: 'Cookbook service',
    },
  ],
  components: {
    schemas: {
      Cookbook: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          author: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          books: {
            type: 'array',
            items: { type: 'string' },
          },
          theme: {
            type: 'string',
            enum: ['modern', 'classic', 'rustic', 'minimalist', 'elegant'],
          },
          layout: {
            type: 'string',
            enum: ['single-column', 'two-column', 'magazine'],
          },
          paperSize: {
            type: 'string',
            enum: ['A4', 'Letter', 'Legal', 'A5'],
          },
          coverImage: { type: 'string' },
          customColors: {
            type: 'object',
            properties: {
              primary: { type: 'string' },
              secondary: { type: 'string' },
              accent: { type: 'string' },
            },
          },
          authorBio: { type: 'string' },
          authorImage: { type: 'string' },
          status: {
            type: 'string',
            enum: ['draft', 'generating', 'completed', 'failed'],
          },
          pdfUrl: { type: 'string' },
          generationProgress: { type: 'number' },
          errorMessage: { type: 'string' },
          isPublic: { type: 'boolean' },
          isActive: { type: 'boolean' },
          pageCount: { type: 'number' },
          fileSize: { type: 'number' },
          lastGeneratedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Book: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          cookbook: { type: 'string' },
          layout: { type: 'string' },
          recipe: {
            type: 'object',
            properties: {
              basicInfo: {
                type: 'object',
                properties: {
                  recipeName: { type: 'string' },
                  duration: {
                    type: 'object',
                    properties: {
                      value: { type: 'string' },
                      label: { type: 'string' },
                    },
                  },
                  level: {
                    type: 'object',
                    properties: {
                      value: { type: 'string' },
                      label: { type: 'string' },
                    },
                  },
                  serving: {
                    type: 'object',
                    properties: {
                      value: { type: 'string' },
                      label: { type: 'string' },
                    },
                  },
                  tags: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        value: { type: 'string' },
                        label: { type: 'string' },
                      },
                    },
                  },
                  categories: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        value: { type: 'string' },
                        label: { type: 'string' },
                      },
                    },
                  },
                },
              },
              details: {
                type: 'object',
                properties: {
                  thumbnail: { type: 'string' },
                  about: { type: 'array', items: { type: 'object' } },
                  faqs: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        ques: { type: 'string' },
                        ans: { type: 'string' },
                      },
                    },
                  },
                },
              },
              directions: {
                type: 'object',
                properties: {
                  methods: { type: 'array', items: { type: 'object' } },
                  ingredients: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        type: { type: 'string', enum: ['main', 'dressing'] },
                      },
                    },
                  },
                },
              },
              author: { type: 'string' },
            },
          },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sectionId: { type: 'string' },
                sectionType: {
                  type: 'string',
                  enum: ['frontCover', 'backCover', 'intro', 'toc', 'notes', 'recipe'],
                },
                content: { type: 'string' },
                lastEditedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
          },
          isPublic: { type: 'boolean' },
          isActive: { type: 'boolean' },
          publishedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/api/cookbook': {
      post: {
        summary: 'Create a new cookbook',
        tags: ['Cookbook'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  recipes: { type: 'array', items: { type: 'string' } },
                  theme: { type: 'string' },
                  layout: { type: 'string' },
                  coverImage: { type: 'string' },
                  customColors: { type: 'object' },
                  authorBio: { type: 'string' },
                  authorImage: { type: 'string' },
                  isPublic: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Cookbook created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Cookbook' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/cookbook/{cookbookId}': {
      get: {
        summary: 'Get cookbook by ID',
        tags: ['Cookbook'],
        parameters: [
          {
            name: 'cookbookId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Cookbook retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Cookbook' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update cookbook',
        tags: ['Cookbook'],
        parameters: [
          {
            name: 'cookbookId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  recipes: { type: 'array', items: { type: 'string' } },
                  theme: { type: 'string' },
                  layout: { type: 'string' },
                  coverImage: { type: 'string' },
                  customColors: { type: 'object' },
                  authorBio: { type: 'string' },
                  authorImage: { type: 'string' },
                  isPublic: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Cookbook updated successfully',
          },
        },
      },
      delete: {
        summary: 'Delete cookbook',
        tags: ['Cookbook'],
        parameters: [
          {
            name: 'cookbookId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Cookbook deleted successfully',
          },
        },
      },
    },
    '/api/cookbook/my': {
      get: {
        summary: "Get user's cookbooks",
        tags: ['Cookbook'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer' },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer' },
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'isPublic',
            in: 'query',
            schema: { type: 'boolean' },
          },
        ],
        responses: {
          200: {
            description: "User's cookbooks retrieved successfully",
          },
        },
      },
    },
    '/api/cookbook/public': {
      get: {
        summary: 'Get public cookbooks',
        tags: ['Cookbook'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer' },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Public cookbooks retrieved successfully',
          },
        },
      },
    },
    '/api/cookbook/{cookbookId}/generate': {
      post: {
        summary: 'Generate cookbook PDF',
        tags: ['Cookbook'],
        parameters: [
          {
            name: 'cookbookId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          202: {
            description: 'Cookbook generation started',
          },
        },
      },
    },
    '/api/books': {
      post: {
        summary: 'Create a new book',
        tags: ['Book'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cookbookId'],
                properties: {
                  cookbookId: { type: 'string' },
                  layout: { type: 'string' },
                  sections: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        sectionId: { type: 'string' },
                        sectionType: { type: 'string' },
                        content: { type: 'string' },
                      },
                    },
                  },
                  recipeData: {
                    type: 'object',
                    description: 'Optional recipe data to embed in the book',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Book created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Book' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/books/{bookId}': {
      get: {
        summary: 'Get book by ID',
        tags: ['Book'],
        parameters: [
          {
            name: 'bookId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Book retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Book' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update book',
        tags: ['Book'],
        parameters: [
          {
            name: 'bookId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  layout: { type: 'string' },
                  sections: { type: 'array', items: { type: 'object' } },
                  status: { type: 'string' },
                  isPublic: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Book updated successfully',
          },
        },
      },
      delete: {
        summary: 'Delete book',
        tags: ['Book'],
        parameters: [
          {
            name: 'bookId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Book deleted successfully',
          },
        },
      },
    },
    '/api/books/my': {
      get: {
        summary: "Get user's books",
        tags: ['Book'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer' },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer' },
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'isPublic',
            in: 'query',
            schema: { type: 'boolean' },
          },
          {
            name: 'cookbookId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter books by cookbook ID',
          },
        ],
        responses: {
          200: {
            description: "User's books retrieved successfully",
          },
        },
      },
    },
    '/api/books/{bookId}/publish': {
      post: {
        summary: 'Publish book',
        tags: ['Book'],
        parameters: [
          {
            name: 'bookId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Book published successfully',
          },
        },
      },
    },
  },
};
