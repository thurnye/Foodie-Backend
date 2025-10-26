import cors from 'cors';

/**
 * CORS configuration - allows multiple origins
 */
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:8000',
  'http://localhost:4000',
  process.env.CORS_ORIGIN,
].filter(Boolean);

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'x-request-id', 'x-device-fingerprint', 'x-bot-score'],
  exposedHeaders: ['x-access-token', 'x-request-id'],
};

export default cors(corsOptions);
