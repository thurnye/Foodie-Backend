import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger, mapErrorToResponse } from '@foodie/libs';

// Load environment variables
dotenv.config();

// Import routes
import authRouter from './routes/auth';


const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI!;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN!,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
// app.get('/health', healthCheck);

// Routes
app.use('/', authRouter);

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

// Store server instance for graceful shutdown
let server: any;

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB', { database: MONGODB_URI });

    // Start server and store instance
    server = app.listen(PORT, () => {
      logger.info(`Auth service running on port ${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error('MongoDB connection error:', error?.message || error);
    logger.error('MongoDB connection error', { error: error?.message || error });
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      mongoose.connection.close(false).then(() => {
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    });
  } else {
    mongoose.connection.close(false).then(() => {
      process.exit(0);
    });
  }
});

export default app;
