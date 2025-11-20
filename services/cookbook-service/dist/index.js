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
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const libs_1 = require("@foodie/libs");
const cookbook_routes_1 = __importDefault(require("./routes/cookbook.routes"));
const book_routes_1 = __importDefault(require("./routes/book.routes"));
const pdf_routes_1 = __importDefault(require("./routes/pdf.routes"));
const userContext_1 = require("./middleware/userContext");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3004;
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
    libs_1.logger.info('Cookbook Service: Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
    });
    next();
});
app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'Cookbook service is healthy' });
});
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.use('/api/cookbook', cookbook_routes_1.default);
app.use('/api/books', book_routes_1.default);
app.use('/api/cookbook/pdf', pdf_routes_1.default);
app.use('/cookbook', cookbook_routes_1.default);
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
app.use((err, _req, res, _next) => {
    const { statusCode, ...errorResponse } = (0, libs_1.mapErrorToResponse)(err);
    libs_1.logger.error('Cookbook Service: Request error', {
        error: err.message,
        stack: err.stack,
    });
    res.status(statusCode).json(errorResponse);
});
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    libs_1.logger.info('Cookbook Service: Connected to MongoDB', {
        database: MONGODB_URI,
    });
})
    .catch((error) => {
    libs_1.logger.error('Cookbook Service: MongoDB connection error', {
        error: error.message,
    });
    process.exit(1);
});
const server = app.listen(PORT, () => {
    libs_1.logger.info(`Cookbook service running on port ${PORT}`);
});
process.on('SIGTERM', () => {
    libs_1.logger.info('SIGTERM received, closing server gracefully');
    server.close(() => {
        mongoose_1.default.connection.close();
        libs_1.logger.info('Server and database connections closed');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map