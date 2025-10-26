import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Health check endpoint
 */
export const healthCheck = async (_req: Request, res: Response) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    service: 'user-service',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  };

  try {
    res.status(200).json(health);
  } catch (error) {
    health.status = 'ERROR';
    res.status(503).json(health);
  }
};
