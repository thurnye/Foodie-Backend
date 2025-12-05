"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const libs_1 = require("@foodie/libs");
const routes_1 = __importDefault(require("./routes"));
const socket_1 = require("./socket");
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
const PORT = process.env.PORT || 3009;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FoodieBlog';
const NODE_ENV = process.env.NODE_ENV || 'development';
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
if (NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use('/api/communication', routes_1.default);
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Communication Service API',
        version: '1.0.0',
        status: 'running',
    });
});
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});
app.use((err, _req, res, _next) => {
    libs_1.logger.error('Error:', err);
    if (err.isOperational) {
        return res.status(err.statusCode || 500).json({
            success: false,
            error: err.message,
        });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            details: err.errors,
        });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format',
        });
    }
    return res.status(500).json({
        success: false,
        error: NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
});
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        libs_1.logger.info('MongoDB connected successfully');
    }
    catch (error) {
        libs_1.logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
const startServer = async () => {
    try {
        await connectDB();
        (0, socket_1.initializeWebSocket)(httpServer);
        httpServer.listen(PORT, () => {
            libs_1.logger.info(`Communication service running on port ${PORT}`);
            libs_1.logger.info(`Environment: ${NODE_ENV}`);
        });
    }
    catch (error) {
        libs_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', async () => {
    libs_1.logger.info('SIGTERM signal received. Closing HTTP server...');
    httpServer.close(async () => {
        libs_1.logger.info('HTTP server closed');
        await mongoose_1.default.connection.close();
        libs_1.logger.info('Database connection closed');
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    libs_1.logger.info('SIGINT signal received. Closing HTTP server...');
    httpServer.close(async () => {
        libs_1.logger.info('HTTP server closed');
        await mongoose_1.default.connection.close();
        libs_1.logger.info('Database connection closed');
        process.exit(0);
    });
});
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map