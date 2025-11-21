import express, { Request, Response } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from '@foodie/libs';
import config from './config';

// Middleware
import corsMiddleware from './middleware/cors';
import { requestId } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { defaultRateLimit } from './middleware/rateLimit';
import { optionalAuth } from './middleware/auth';

// Proxy routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import recipeRoutes from './routes/recipes';
import eventRoutes from './routes/events';
import reviewRoutes from './routes/reviews';
import cookbookRoutes from './routes/cookbooks';
import bookRoutes from './routes/books';
import communityRoutes from './routes/community';

// Utilities
import { healthCheck } from './health';
import { metricsHandler } from './metrics';
import { swaggerUiServe, swaggerUiSetup } from './swagger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = config.PORT;

// --- Security and basic middleware ---
app.use(helmet());
app.use(corsMiddleware);
app.use(requestId);
app.use(defaultRateLimit);

// --- Extract user from JWT token (optional) ---
app.use(optionalAuth);

// --- Proxy microservice routes BEFORE body parsers ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/recipe', recipeRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/cookbook', cookbookRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/community', communityRoutes);

// ---Apply parsers AFTER proxy routes for local-only endpoints ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health & Docs
app.get('/health', healthCheck);
app.get('/metrics', metricsHandler);
app.use('/api-docs', swaggerUiServe, swaggerUiSetup);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Foodie Backend API Gateway',
    version: '1.0.0',
  });
});

// 404 + global error handling
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.path}` });
});
app.use(errorHandler);

// Store server instance for graceful shutdown
const server = app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing API Gateway gracefully');
  server.close(() => {
    logger.info('API Gateway HTTP server closed');
    process.exit(0);
  });
});

export default app;
