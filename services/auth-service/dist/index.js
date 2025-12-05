"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const libs_1 = require("@foodie/libs");
const auth_1 = __importDefault(require("./routes/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((req, _res, next) => {
    libs_1.logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
    });
    next();
});
app.use('/', auth_1.default);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
app.use((err, req, res, _next) => {
    libs_1.logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        path: req.path,
    });
    const errorResponse = (0, libs_1.mapErrorToResponse)(err);
    res.status(errorResponse.statusCode).json(errorResponse);
});
let server;
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    libs_1.logger.info('Connected to MongoDB', { database: MONGODB_URI });
    server = app.listen(PORT, () => {
        libs_1.logger.info(`Auth service running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error?.message || error);
    libs_1.logger.error('MongoDB connection error', { error: error?.message || error });
    process.exit(1);
});
process.on('SIGTERM', () => {
    libs_1.logger.info('SIGTERM received, closing server gracefully');
    if (server) {
        server.close(() => {
            libs_1.logger.info('HTTP server closed');
            mongoose_1.default.connection.close(false).then(() => {
                libs_1.logger.info('MongoDB connection closed');
                process.exit(0);
            });
        });
    }
    else {
        mongoose_1.default.connection.close(false).then(() => {
            process.exit(0);
        });
    }
});
exports.default = app;
//# sourceMappingURL=index.js.map