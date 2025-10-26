"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapErrorToResponse = exports.Errors = exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiError = ApiError;
exports.Errors = {
    badRequest: (message = 'Bad Request') => new ApiError(400, message),
    unauthorized: (message = 'Unauthorized') => new ApiError(401, message),
    forbidden: (message = 'Forbidden') => new ApiError(403, message),
    notFound: (message = 'Not Found') => new ApiError(404, message),
    conflict: (message = 'Conflict') => new ApiError(409, message),
    unprocessableEntity: (message = 'Unprocessable Entity') => new ApiError(422, message),
    internalServer: (message = 'Internal Server Error') => new ApiError(500, message, false),
};
const mapErrorToResponse = (error) => {
    if (error instanceof ApiError) {
        return {
            statusCode: error.statusCode,
            success: false,
            message: error.message,
        };
    }
    return {
        statusCode: 500,
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : error.message,
    };
};
exports.mapErrorToResponse = mapErrorToResponse;
//# sourceMappingURL=errors.js.map