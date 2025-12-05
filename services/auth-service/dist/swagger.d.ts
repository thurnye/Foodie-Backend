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
    paths: {
        '/register': {
            post: {
                summary: string;
                tags: string[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                properties: {
                                    email: {
                                        type: string;
                                        format: string;
                                    };
                                    password: {
                                        type: string;
                                        minLength: number;
                                    };
                                    firstName: {
                                        type: string;
                                    };
                                    lastName: {
                                        type: string;
                                    };
                                    username: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
            };
        };
        '/login': {
            post: {
                summary: string;
                tags: string[];
            };
        };
        '/me': {
            get: {
                summary: string;
                tags: string[];
            };
        };
    };
};
//# sourceMappingURL=swagger.d.ts.map