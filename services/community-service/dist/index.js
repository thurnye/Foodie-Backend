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
const child_process_1 = require("child_process");
const libs_1 = require("@foodie/libs");
const community_routes_1 = __importDefault(require("./routes/community.routes"));
const userContext_1 = require("./middleware/userContext");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3005;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FoodieBlog';
if (process.env.NODE_ENV !== 'production') {
    try {
        (0, child_process_1.execSync)(`lsof -ti:${PORT} | xargs kill -9`, { stdio: 'ignore' });
        console.log(` Cleared port ${PORT} before starting server`);
    }
    catch {
    }
}
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(userContext_1.userContextMiddleware);
app.use((req, _res, next) => {
    libs_1.logger.info('Community Service: Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
    });
    next();
});
app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'Community service is healthy' });
});
app.use('/api/community', community_routes_1.default);
app.use('/community', community_routes_1.default);
app.use((err, req, res, _next) => {
    libs_1.logger.error('Unhandled error', {
        error: err.message || err,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    const errorResponse = (0, libs_1.mapErrorToResponse)(err);
    res.status(errorResponse.statusCode).json({
        success: false,
        message: errorResponse.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.path}`,
    });
});
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    libs_1.logger.info('Community Service: Connected to MongoDB', {
        database: MONGODB_URI,
    });
    app.listen(PORT, () => {
        libs_1.logger.info(`Community service running on port ${PORT}`);
    });
})
    .catch((error) => {
    libs_1.logger.error('Community Service: MongoDB connection error', {
        error: error.message,
        stack: error.stack,
    });
    process.exit(1);
});
process.on('SIGTERM', async () => {
    libs_1.logger.info('SIGTERM received, closing server gracefully');
    await mongoose_1.default.connection.close();
    libs_1.logger.info('Server and database connections closed');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map