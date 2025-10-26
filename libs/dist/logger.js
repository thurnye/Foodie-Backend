"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
const transports = [];
if (process.env.NODE_ENV !== 'production') {
    transports.push(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }));
}
else {
    transports.push(new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }), new winston_1.default.transports.File({ filename: 'logs/combined.log' }));
}
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'foodie-backend' },
    transports,
});
const createRequestLogger = (requestId) => {
    return logger.child({ requestId });
};
exports.createRequestLogger = createRequestLogger;
exports.default = logger;
//# sourceMappingURL=logger.js.map