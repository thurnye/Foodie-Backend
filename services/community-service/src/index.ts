import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { logger, mapErrorToResponse } from '@foodie/libs';
import { userContextMiddleware } from './middleware/userContext';

// Load environment variables
dotenv.config();

import communityRoutes from './routes/community.routes';

const app = express();
const PORT = Number(process.env.PORT) || 3005;
const MONGODB_URI = process.env.MONGODB_URI!;

/* --------------------------------------------
    Kill existing process on same port (dev only)
--------------------------------------------- */
if (process.env.NODE_ENV !== 'production') {
  try {
    execSync(`lsof -ti:${PORT} | xargs kill -9`, { stdio: 'ignore' });
    // console.log(` Cleared port ${PORT} before starting server`);
  } catch {
    // ignore if port is free
  }
}

/* --------------------------------------------
    Middleware
--------------------------------------------- */
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN!,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Extract user context from API Gateway headers
app.use(userContextMiddleware);

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info('Community Service: Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Community service is healthy' });
});

/* --------------------------------------------
   Routes
--------------------------------------------- */
app.use('/api/community', communityRoutes);

// Legacy support
app.use('/community', communityRoutes);

/* --------------------------------------------
   Error Handler
--------------------------------------------- */
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message || err,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const errorResponse = mapErrorToResponse(err);
  res.status(errorResponse.statusCode).json({
    success: false,
    message: errorResponse.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
  });
});

/* --------------------------------------------
   Database Connection & Server Start
--------------------------------------------- */
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('Community Service: Connected to MongoDB', {
      database: MONGODB_URI,
    });

    app.listen(PORT, () => {
      logger.info(`Community service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Community Service: MongoDB connection error', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing server gracefully');
  await mongoose.connection.close();
  logger.info('Server and database connections closed');
  process.exit(0);
});

export default app;
