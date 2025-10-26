"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const healthCheck = async (_req, res) => {
    const health = {
        uptime: process.uptime(),
        timestamp: Date.now(),
        status: 'OK',
        service: 'auth-service',
        database: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
    };
    try {
        res.status(200).json(health);
    }
    catch (error) {
        health.status = 'ERROR';
        res.status(503).json(health);
    }
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=health.js.map