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
        '/add/{userId}': {
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
            };
        };
        '/': {
            post: {
                summary: string;
                tags: string[];
            };
        };
        '/query': {
            post: {
                summary: string;
                tags: string[];
            };
        };
        '/user/{userId}': {
            post: {
                summary: string;
                tags: string[];
            };
        };
        '/{id}': {
            get: {
                summary: string;
                tags: string[];
            };
            patch: {
                summary: string;
                tags: string[];
            };
            delete: {
                summary: string;
                tags: string[];
            };
        };
        '/review/recipe': {
            post: {
                summary: string;
                tags: string[];
            };
        };
        '/generateCookBook/{userId}': {
            post: {
                summary: string;
                tags: string[];
            };
        };
    };
};
//# sourceMappingURL=swagger.d.ts.map