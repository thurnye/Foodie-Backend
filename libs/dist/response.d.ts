import { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface ApiErrorResponse {
    success: boolean;
    data: null;
    errors: Array<{
        code: string;
        message: string;
        field?: string;
    }>;
}
export declare const success: <T>(res: Response, data?: T, message?: string, meta?: any, statusCode?: number) => Response;
export declare const fail: (res: Response, message: string, statusCode?: number, code?: string) => Response;
export declare const failWithErrors: (res: Response, errors: Array<{
    code: string;
    message: string;
    field?: string;
}>, statusCode?: number) => Response;
export declare const paginationMeta: (page: number, limit: number, total: number) => {
    page: number;
    limit: number;
    total: number;
    pages: number;
};
export declare const createSuccessResponse: <T>(data: T, message?: string, pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
}) => ApiResponse<T>;
export declare const createErrorResponse: (errors: Array<{
    code: string;
    message: string;
    field?: string;
}>) => ApiErrorResponse;
//# sourceMappingURL=response.d.ts.map