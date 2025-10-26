"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const libs_1 = require("@foodie/libs");
const health_1 = require("./health");
const recipe_routes_1 = __importDefault(require("./routes/recipe.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const cookbook_routes_1 = __importDefault(require("./routes/cookbook.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FoodieBlog';
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, _res, next) => {
    libs_1.logger.info('Recipe Service: Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
    });
    next();
});
app.get('/health', health_1.healthCheck);
app.use('/api/recipe', recipe_routes_1.default);
app.use('/api/recipe', cookbook_routes_1.default);
app.use('/api/review', review_routes_1.default);
app.use('/recipe', recipe_routes_1.default);
app.use('/recipe', cookbook_routes_1.default);
app.use('/review', review_routes_1.default);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
app.use((err, req, res, _next) => {
    libs_1.logger.error('Recipe Service: Error occurred', {
        error: err.message,
        stack: err.stack,
        path: req.path,
    });
    const errorResponse = (0, libs_1.mapErrorToResponse)(err);
    res.status(errorResponse.statusCode).json(errorResponse);
});
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    libs_1.logger.info('Recipe Service: Connected to MongoDB', { database: MONGODB_URI });
    app.listen(PORT, () => {
        libs_1.logger.info(`Recipe service running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error?.message || error);
    libs_1.logger.error('MongoDB connection error', { error: error?.message || error });
    process.exit(1);
});
process.on('SIGTERM', () => {
    libs_1.logger.info('SIGTERM received, closing server gracefully');
    mongoose_1.default.connection.close();
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map