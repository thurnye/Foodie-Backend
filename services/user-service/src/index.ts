import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger, mapErrorToResponse } from '@foodie/libs';
import { healthCheck } from './health';

// Load environment variables
dotenv.config();

import profileRoutes from './routes/profile.route';

const app = express();
const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI!;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN!,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Health check
app.get('/health', healthCheck);

// Routes
app.use('/', profileRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  const errorResponse = mapErrorToResponse(err);
  res.status(errorResponse.statusCode).json(errorResponse);
});

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB', { database: MONGODB_URI });

    // Start server
    app.listen(PORT, () => {
      logger.info(`User service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error', { error: error.message });
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');
  mongoose.connection.close();
  process.exit(0);
});

export default app;
