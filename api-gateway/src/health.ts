import { Request, Response } from 'express';
import axios from 'axios';
import config from './config';

/**
 * Health check endpoint
 * Checks health of gateway and all services
 */
export const healthCheck = async (_req: Request, res: Response) => {
  const services = {
    'auth-service': config.AUTH_SERVICE_URL,
    'user-service': config.USER_SERVICE_URL,
    'recipe-service': config.RECIPE_SERVICE_URL,
    'event-service': config.EVENT_SERVICE_URL,
  };

  const serviceHealth: any = {};

  // Check each service
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 2000 });
      serviceHealth[name] = response.data.status === 'OK' ? 'healthy' : 'unhealthy';
    } catch (error) {
      serviceHealth[name] = 'unreachable';
    }
  }

  const allHealthy = Object.values(serviceHealth).every(status => status === 'healthy');

  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: allHealthy ? 'OK' : 'DEGRADED',
    service: 'api-gateway',
    services: serviceHealth,
  };

  res.status(allHealthy ? 200 : 503).json(health);
};
