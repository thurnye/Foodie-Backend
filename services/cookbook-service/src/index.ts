import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';
import { logger, mapErrorToResponse } from '@foodie/libs';

// Load environment variables
dotenv.config();

// Import routes
import cookbookRoutes from './routes/cookbook.routes';
import bookRoutes from './routes/book.routes';
import pdfRoutes from './routes/pdf.routes';

// Import middleware
import { userContextMiddleware } from './middleware/userContext';


const app = express();
const PORT = Number(process.env.PORT) || 3004;
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
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : [],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Extract user context from API Gateway headers
app.use(userContextMiddleware);

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info('Cookbook Service: Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Cookbook service is healthy' });
});

// Serve static files (PDF uploads) with proper headers for download
app.use(
  '/uploads',
  (req: Request, res: Response, next: NextFunction) => {
    // Set headers for PDF files to enable download
    if (req.path.endsWith('.pdf')) {
      const filename = path.basename(req.path);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    }
    next();
  },
  express.static(path.join(process.cwd(), 'uploads'))
);

/* --------------------------------------------
   Routes
--------------------------------------------- */
app.use('/api/cookbook', cookbookRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cookbook/pdf', pdfRoutes);

// Legacy support
app.use('/cookbook', cookbookRoutes);

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const { statusCode, ...errorResponse } = mapErrorToResponse(err);
  logger.error('Cookbook Service: Request error', {
    error: err.message,
    stack: err.stack,
  });
  res.status(statusCode).json(errorResponse);
});

/* --------------------------------------------
    MongoDB Connection
--------------------------------------------- */
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('Cookbook Service: Connected to MongoDB', {
      database: MONGODB_URI,
    });
  })
  .catch((error) => {
    logger.error('Cookbook Service: MongoDB connection error', {
      error: error.message,
    });
    process.exit(1);
  });

/* --------------------------------------------
   Start Server
--------------------------------------------- */
const server = app.listen(PORT, () => {
  logger.info(`Cookbook service running on port ${PORT}`);
});

/* --------------------------------------------
    Graceful Shutdown
--------------------------------------------- */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');
  server.close(() => {
    mongoose.connection.close();
    logger.info('Server and database connections closed');
    process.exit(0);
  });
});

export default app;
