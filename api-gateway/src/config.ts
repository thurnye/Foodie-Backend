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
  AUTH_SERVICE_URL: Joi.string().uri().required(),
  USER_SERVICE_URL: Joi.string().uri().required(),
  RECIPE_SERVICE_URL: Joi.string().uri().required(),
  EVENT_SERVICE_URL: Joi.string().uri().required(),
  COMMUNITY_SERVICE_URL: Joi.string().uri().required(),
  GROUP_SERVICE_URL: Joi.string().uri().required(),
  CHAT_SERVICE_URL: Joi.string().uri().required(),
  NEWS_SERVICE_URL: Joi.string().uri().required(),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().required(),

  // CORS
  CORS_ORIGIN: Joi.string().required(),

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
