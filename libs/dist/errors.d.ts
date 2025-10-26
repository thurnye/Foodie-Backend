export declare class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(statusCode: number, message: string, isOperational?: boolean, stack?: string);
}
export declare const Errors: {
    badRequest: (message?: string) => ApiError;
    unauthorized: (message?: string) => ApiError;
    forbidden: (message?: string) => ApiError;
    notFound: (message?: string) => ApiError;
    conflict: (message?: string) => ApiError;
    unprocessableEntity: (message?: string) => ApiError;
    internalServer: (message?: string) => ApiError;
};
export declare const mapErrorToResponse: (error: Error | ApiError) => {
    statusCode: number;
    success: boolean;
    message: string;
};
//# sourceMappingURL=errors.d.ts.map