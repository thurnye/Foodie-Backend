"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const libs_1 = require("@foodie/libs");
const config_1 = __importDefault(require("./config"));
const cors_1 = __importDefault(require("./middleware/cors"));
const requestId_1 = require("./middleware/requestId");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimit_1 = require("./middleware/rateLimit");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const recipes_1 = __importDefault(require("./routes/recipes"));
const events_1 = __importDefault(require("./routes/events"));
const health_1 = require("./health");
const metrics_1 = require("./metrics");
const swagger_1 = require("./swagger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = config_1.default.PORT;
app.use((0, helmet_1.default)());
app.use(cors_1.default);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(requestId_1.requestId);
app.use((req, _res, next) => {
    libs_1.logger.info('Gateway request', {
        method: req.method,
        path: req.path,
        requestId: req.requestId,
        ip: req.ip,
    });
    next();
});
app.use(rateLimit_1.defaultRateLimit);
app.get('/health', health_1.healthCheck);
app.get('/metrics', metrics_1.metricsHandler);
app.use('/api-docs', swagger_1.swaggerUiServe, swagger_1.swaggerUiSetup);
const reviews_1 = __importDefault(require("./routes/reviews"));
app.use('/api/auth', auth_1.default);
app.use('/api/user', users_1.default);
app.use('/api/recipe', recipes_1.default);
app.use('/api/review', reviews_1.default);
app.use('/api/event', events_1.default);
app.use('/auth', auth_1.default);
app.use('/user', users_1.default);
app.use('/recipe', recipes_1.default);
app.use('/review', reviews_1.default);
app.use('/event', events_1.default);
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Foodie Backend API Gateway',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            metrics: '/metrics',
            docs: '/api-docs',
            auth: '/api/auth/*',
            user: '/api/user/*',
            recipe: '/api/recipe/*',
            event: '/api/event/*',
        },
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
    });
});
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    libs_1.logger.info(`API Gateway running on port ${PORT}`);
    libs_1.logger.info('Service URLs:', {
        auth: config_1.default.AUTH_SERVICE_URL,
        user: config_1.default.USER_SERVICE_URL,
        recipe: config_1.default.RECIPE_SERVICE_URL,
        event: config_1.default.EVENT_SERVICE_URL,
    });
});
process.on('SIGTERM', () => {
    libs_1.logger.info('SIGTERM received, closing gateway gracefully');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map