"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = exports.createSuccessResponse = exports.paginationMeta = exports.failWithErrors = exports.fail = exports.success = void 0;
const success = (res, data, message, meta, statusCode = 200) => {
    let pagination;
    if (meta && typeof meta === 'object' && ('page' in meta || 'totalPages' in meta)) {
        pagination = {
            page: meta.page || 1,
            limit: meta.limit || 12,
            total: meta.total || 0,
            pages: meta.totalPages || meta.pages || 0,
        };
    }
    const response = {
        success: true,
        data: data !== undefined ? data : null,
        ...(message && { message }),
        ...(pagination && { pagination }),
    };
    return res.status(statusCode).json(response);
};
exports.success = success;
const fail = (res, message, statusCode = 400, code) => {
    const response = {
        success: false,
        data: null,
        errors: [
            {
                code: code || getErrorCodeFromStatus(statusCode),
                message,
            },
        ],
    };
    return res.status(statusCode).json(response);
};
exports.fail = fail;
function getErrorCodeFromStatus(statusCode) {
    const codeMap = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        409: 'CONFLICT',
        422: 'VALIDATION_ERROR',
        429: 'RATE_LIMIT_ERROR',
        500: 'INTERNAL_ERROR',
        503: 'SERVICE_UNAVAILABLE',
    };
    return codeMap[statusCode] || 'ERROR';
}
const failWithErrors = (res, errors, statusCode = 400) => {
    const response = {
        success: false,
        data: null,
        errors,
    };
    return res.status(statusCode).json(response);
};
exports.failWithErrors = failWithErrors;
const paginationMeta = (page, limit, total) => {
    const pages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        pages,
    };
};
exports.paginationMeta = paginationMeta;
const createSuccessResponse = (data, message, pagination) => {
    return {
        success: true,
        data,
        ...(message && { message }),
        ...(pagination && { pagination }),
    };
};
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (errors) => {
    return {
        success: false,
        data: null,
        errors,
    };
};
exports.createErrorResponse = createErrorResponse;
//# sourceMappingURL=response.js.map