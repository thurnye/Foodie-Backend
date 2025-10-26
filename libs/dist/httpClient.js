"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("./logger"));
const createHttpClient = (baseURL, options) => {
    const client = axios_1.default.create({
        baseURL,
        timeout: 10000,
        ...options,
    });
    client.interceptors.request.use((config) => {
        const requestId = config.headers?.['x-request-id'] || generateRequestId();
        config.headers = config.headers || {};
        config.headers['x-request-id'] = requestId;
        logger_1.default.info('HTTP Request', {
            method: config.method,
            url: config.url,
            requestId,
        });
        return config;
    }, (error) => {
        logger_1.default.error('HTTP Request Error', { error: error.message });
        return Promise.reject(error);
    });
    client.interceptors.response.use((response) => {
        logger_1.default.info('HTTP Response', {
            status: response.status,
            url: response.config.url,
        });
        return response;
    }, async (error) => {
        const config = error.config;
        if (!config || !config._retry) {
            config._retry = 0;
        }
        if (config._retry < 3 && (!error.response || error.response.status >= 500)) {
            config._retry += 1;
            logger_1.default.warn(`Retrying request (${config._retry}/3)`, {
                url: config.url,
            });
            return client(config);
        }
        logger_1.default.error('HTTP Response Error', {
            status: error.response?.status,
            message: error.message,
            url: config?.url,
        });
        return Promise.reject(error);
    });
    return client;
};
exports.createHttpClient = createHttpClient;
const generateRequestId = () => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
//# sourceMappingURL=httpClient.js.map