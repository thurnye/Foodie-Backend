export declare const swaggerSpec: {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    servers: {
        url: string;
        description: string;
    }[];
    components: {
        schemas: {
            Cookbook: {
                type: string;
                properties: {
                    _id: {
                        type: string;
                    };
                    author: {
                        type: string;
                    };
                    title: {
                        type: string;
                    };
                    description: {
                        type: string;
                    };
                    books: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    theme: {
                        type: string;
                        enum: string[];
                    };
                    layout: {
                        type: string;
                        enum: string[];
                    };
                    paperSize: {
                        type: string;
                        enum: string[];
                    };
                    coverImage: {
                        type: string;
                    };
                    customColors: {
                        type: string;
                        properties: {
                            primary: {
                                type: string;
                            };
                            secondary: {
                                type: string;
                            };
                            accent: {
                                type: string;
                            };
                        };
                    };
                    authorBio: {
                        type: string;
                    };
                    authorImage: {
                        type: string;
                    };
                    status: {
                        type: string;
                        enum: string[];
                    };
                    pdfUrl: {
                        type: string;
                    };
                    generationProgress: {
                        type: string;
                    };
                    errorMessage: {
                        type: string;
                    };
                    isPublic: {
                        type: string;
                    };
                    isActive: {
                        type: string;
                    };
                    pageCount: {
                        type: string;
                    };
                    fileSize: {
                        type: string;
                    };
                    lastGeneratedAt: {
                        type: string;
                        format: string;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                    };
                    updatedAt: {
                        type: string;
                        format: string;
                    };
                };
            };
            Book: {
                type: string;
                properties: {
                    _id: {
                        type: string;
                    };
                    cookbook: {
                        type: string;
                    };
                    layout: {
                        type: string;
                    };
                    recipe: {
                        type: string;
                        properties: {
                            basicInfo: {
                                type: string;
                                properties: {
                                    recipeName: {
                                        type: string;
                                    };
                                    duration: {
                                        type: string;
                                        properties: {
                                            value: {
                                                type: string;
                                            };
                                            label: {
                                                type: string;
                                            };
                                        };
                                    };
                                    level: {
                                        type: string;
                                        properties: {
                                            value: {
                                                type: string;
                                            };
                                            label: {
                                                type: string;
                                            };
                                        };
                                    };
                                    serving: {
                                        type: string;
                                        properties: {
                                            value: {
                                                type: string;
                                            };
                                            label: {
                                                type: string;
                                            };
                                        };
                                    };
                                    tags: {
                                        type: string;
                                        items: {
                                            type: string;
                                            properties: {
                                                value: {
                                                    type: string;
                                                };
                                                label: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                    categories: {
                                        type: string;
                                        items: {
                                            type: string;
                                            properties: {
                                                value: {
                                                    type: string;
                                                };
                                                label: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            details: {
                                type: string;
                                properties: {
                                    thumbnail: {
                                        type: string;
                                    };
                                    about: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                    faqs: {
                                        type: string;
                                        items: {
                                            type: string;
                                            properties: {
                                                ques: {
                                                    type: string;
                                                };
                                                ans: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            directions: {
                                type: string;
                                properties: {
                                    methods: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                    ingredients: {
                                        type: string;
                                        items: {
                                            type: string;
                                            properties: {
                                                name: {
                                                    type: string;
                                                };
                                                type: {
                                                    type: string;
                                                    enum: string[];
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            author: {
                                type: string;
                            };
                        };
                    };
                    sections: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                sectionId: {
                                    type: string;
                                };
                                sectionType: {
                                    type: string;
                                    enum: string[];
                                };
                                content: {
                                    type: string;
                                };
                                lastEditedAt: {
                                    type: string;
                                    format: string;
                                };
                            };
                        };
                    };
                    status: {
                        type: string;
                        enum: string[];
                    };
                    isPublic: {
                        type: string;
                    };
                    isActive: {
                        type: string;
                    };
                    publishedAt: {
                        type: string;
                        format: string;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                    };
                    updatedAt: {
                        type: string;
                        format: string;
                    };
                };
            };
        };
    };
    paths: {
        '/api/cookbook': {
            post: {
                summary: string;
                tags: string[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    title: {
                                        type: string;
                                    };
                                    description: {
                                        type: string;
                                    };
                                    recipes: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                    theme: {
                                        type: string;
                                    };
                                    layout: {
                                        type: string;
                                    };
                                    coverImage: {
                                        type: string;
                                    };
                                    customColors: {
                                        type: string;
                                    };
                                    authorBio: {
                                        type: string;
                                    };
                                    authorImage: {
                                        type: string;
                                    };
                                    isPublic: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        success: {
                                            type: string;
                                        };
                                        data: {
                                            $ref: string;
                                        };
                                        message: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/cookbook/{cookbookId}': {
            get: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        success: {
                                            type: string;
                                        };
                                        data: {
                                            $ref: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            put: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                properties: {
                                    title: {
                                        type: string;
                                    };
                                    description: {
                                        type: string;
                                    };
                                    recipes: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                    theme: {
                                        type: string;
                                    };
                                    layout: {
                                        type: string;
                                    };
                                    coverImage: {
                                        type: string;
                                    };
                                    customColors: {
                                        type: string;
                                    };
                                    authorBio: {
                                        type: string;
                                    };
                                    authorImage: {
                                        type: string;
                                    };
                                    isPublic: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
            delete: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
        };
        '/api/cookbook/my': {
            get: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
        };
        '/api/cookbook/public': {
            get: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
        };
        '/api/cookbook/{cookbookId}/generate': {
            post: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    202: {
                        description: string;
                    };
                };
            };
        };
        '/api/books': {
            post: {
                summary: string;
                tags: string[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    cookbookId: {
                                        type: string;
                                    };
                                    layout: {
                                        type: string;
                                    };
                                    sections: {
                                        type: string;
                                        items: {
                                            type: string;
                                            properties: {
                                                sectionId: {
                                                    type: string;
                                                };
                                                sectionType: {
                                                    type: string;
                                                };
                                                content: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                    recipeData: {
                                        type: string;
                                        description: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        success: {
                                            type: string;
                                        };
                                        data: {
                                            $ref: string;
                                        };
                                        message: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/books/{bookId}': {
            get: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        success: {
                                            type: string;
                                        };
                                        data: {
                                            $ref: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            put: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                properties: {
                                    layout: {
                                        type: string;
                                    };
                                    sections: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                    status: {
                                        type: string;
                                    };
                                    isPublic: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
            delete: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
        };
        '/api/books/my': {
            get: {
                summary: string;
                tags: string[];
                parameters: ({
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                    };
                    description?: undefined;
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                    };
                    description: string;
                })[];
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
        };
        '/api/books/{bookId}/publish': {
            post: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=swagger.d.ts.map