import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import logger from './logger';

/**
 * Create HTTP client with retry logic and tracing headers
 */
export const createHttpClient = (baseURL: string, options?: AxiosRequestConfig): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    ...options,
  });

  // Request interceptor - add tracing headers
  client.interceptors.request.use(
    (config) => {
      // Add request ID for distributed tracing
      const requestId = config.headers?.['x-request-id'] || generateRequestId();
      config.headers = config.headers || {};
      config.headers['x-request-id'] = requestId;

      logger.info('HTTP Request', {
        method: config.method,
        url: config.url,
        requestId,
      });

      return config;
    },
    (error) => {
      logger.error('HTTP Request Error', { error: error.message });
      return Promise.reject(error);
    }
  );

  // Response interceptor - log and handle errors
  client.interceptors.response.use(
    (response) => {
      logger.info('HTTP Response', {
        status: response.status,
        url: response.config.url,
      });
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as AxiosRequestConfig & { _retry?: number };

      // Retry logic for network errors
      if (!config || !config._retry) {
        config._retry = 0;
      }

      if (config._retry < 3 && (!error.response || error.response.status >= 500)) {
        config._retry += 1;
        logger.warn(`Retrying request (${config._retry}/3)`, {
          url: config.url,
        });
        return client(config);
      }

      logger.error('HTTP Response Error', {
        status: error.response?.status,
        message: error.message,
        url: config?.url,
      });

      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * Generate unique request ID
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
