import Joi from 'joi';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration schema validation
 */
const configSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Service URLs
  AUTH_SERVICE_URL: Joi.string().uri().default('http://localhost:3001'),
  USER_SERVICE_URL: Joi.string().uri().default('http://localhost:3002'),
  RECIPE_SERVICE_URL: Joi.string().uri().default('http://localhost:3003'),
  EVENT_SERVICE_URL: Joi.string().uri().default('http://localhost:3004'),
  COMMUNITY_SERVICE_URL: Joi.string().uri().default('http://localhost:3005'),
  GROUP_SERVICE_URL: Joi.string().uri().default('http://localhost:3006'),
  CHAT_SERVICE_URL: Joi.string().uri().default('http://localhost:3007'),
  NEWS_SERVICE_URL: Joi.string().uri().default('http://localhost:3008'),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().required(),

  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
}).unknown();

/**
 * Validate and export configuration
 */
const { error, value: config } = configSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default config;
