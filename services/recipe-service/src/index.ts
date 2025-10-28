import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { logger, mapErrorToResponse } from '@foodie/libs';
import { healthCheck } from './health';

// Import routes
import recipeRoutes from './routes/recipe.routes';
import reviewRoutes from './routes/review.routes';
import cookbookRoutes from './routes/cookbook.routes';

// Import middleware
import { userContextMiddleware } from './middleware/userContext';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FoodieBlog';

/* --------------------------------------------
   🔧 Kill existing process on same port (dev only)
--------------------------------------------- */
if (process.env.NODE_ENV !== 'production') {
  try {
    execSync(`lsof -ti:${PORT} | xargs kill -9`, { stdio: 'ignore' });
    console.log(`🧹 Cleared port ${PORT} before starting server`);
  } catch {
    // ignore if port is free
  }
}

/* --------------------------------------------
   🧩 Middleware
--------------------------------------------- */
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Extract user context from API Gateway headers
app.use(userContextMiddleware);

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info('Recipe Service: Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Health check
app.get('/health', healthCheck);

/* --------------------------------------------
   🛣️ Routes
--------------------------------------------- */
app.use('/api/recipe', recipeRoutes);
app.use('/api/recipe', cookbookRoutes);
app.use('/api/review', reviewRoutes);

// Legacy support
app.use('/recipe', recipeRoutes);
app.use('/recipe', cookbookRoutes);
app.use('/review', reviewRoutes);

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Recipe Service: Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  const errorResponse = mapErrorToResponse(err);
  res.status(errorResponse.statusCode).json(errorResponse);
});

/* --------------------------------------------
   🚀 MongoDB + Server Init
--------------------------------------------- */
let server: import('http').Server;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('Recipe Service: Connected to MongoDB', { database: MONGODB_URI });

    server = app.listen(PORT, () => {
      logger.info(`🍳 Recipe service running on port ${PORT}`);
    });
  })
  .catch((error: any) => {
    logger.error('MongoDB connection error', { error: error?.message || error });
    process.exit(1);
  });

/* --------------------------------------------
   🧘 Graceful Shutdown
--------------------------------------------- */
const shutdown = (signal: string) => {
  logger.info(`${signal} received, closing server gracefully`);

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
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
