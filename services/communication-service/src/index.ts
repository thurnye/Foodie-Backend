import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { logger, Errors } from '@foodie/libs';
import routes from './routes';
import { initializeWebSocket } from './socket';

const app: Application = express();
const httpServer = http.createServer(app);

// Environment variables
const PORT = process.env.PORT || 3009;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FoodieBlog';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Morgan logger (HTTP request logger)
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API routes
app.use('/api/communication', routes);

// Root health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Communication Service API',
    version: '1.0.0',
    status: 'running',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', err);

  // Handle operational errors
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: err.message,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors,
    });
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
    });
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// Database connection
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Initialize WebSocket
    initializeWebSocket(httpServer);

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`Communication service running on port ${PORT}`);
      logger.info(`Environment: ${NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received. Closing HTTP server...');
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received. Closing HTTP server...');
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  });
});

// Start the server
startServer();

export default app;
