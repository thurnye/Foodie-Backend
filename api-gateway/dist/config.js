'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const joi_1 = __importDefault(require('joi'));
const dotenv_1 = __importDefault(require('dotenv'));
dotenv_1.default.config();
const configSchema = joi_1.default
  .object({
    PORT: joi_1.default.number().default(3000),
    NODE_ENV: joi_1.default
      .string()
      .valid('development', 'production', 'test')
      .default('development'),
    AUTH_SERVICE_URL: joi_1.default
      .string()
      .uri()
      .default('http://localhost:3001'),
    USER_SERVICE_URL: joi_1.default
      .string()
      .uri()
      .default('http://localhost:3002'),
    RECIPE_SERVICE_URL: joi_1.default
      .string()
      .uri()
      .default('http://localhost:3003'),
    EVENT_SERVICE_URL: joi_1.default
      .string()
      .uri()
      .default('http://localhost:3004'),
    COMMUNITY_SERVICE_URL: joi_1.default
      .string()
      .uri()
      .default('http://localhost:3005'),
    GROUP_SERVICE_URL: joi_1.default
      .string()
      .uri()
      .default('http://localhost:3006'),
    CHAT_SERVICE_URL: joi_1.default
      .string()
      .uri()
      .default('http://localhost:3007'),
    NEWS_SERVICE_URL: joi_1.default
      .string()
      .uri()
      .default('http://localhost:3008'),
    JWT_ACCESS_SECRET: joi_1.default.string().required(),
    CORS_ORIGIN: joi_1.default.string().default('http://localhost:3000'),
    LOG_LEVEL: joi_1.default
      .string()
      .valid('error', 'warn', 'info', 'debug')
      .default('info'),
  })
  .unknown();
const { error, value: config } = configSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
exports.default = config;
//# sourceMappingURL=config.js.map
