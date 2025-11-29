"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("./config"));
const healthCheck = async (_req, res) => {
    const services = {
        'auth-service': config_1.default.AUTH_SERVICE_URL,
        'user-service': config_1.default.USER_SERVICE_URL,
        'recipe-service': config_1.default.RECIPE_SERVICE_URL,
        'event-service': config_1.default.EVENT_SERVICE_URL,
        'community-service': config_1.default.COMMUNITY_SERVICE_URL,
    };
    const serviceHealth = {};
    for (const [name, url] of Object.entries(services)) {
        try {
            const response = await axios_1.default.get(`${url}/health`, { timeout: 2000 });
            serviceHealth[name] = response.data.status === 'OK' ? 'healthy' : 'unhealthy';
        }
        catch (error) {
            serviceHealth[name] = 'unreachable';
        }
    }
    const allHealthy = Object.values(serviceHealth).every(status => status === 'healthy');
    const health = {
        uptime: process.uptime(),
        timestamp: Date.now(),
        status: allHealthy ? 'OK' : 'DEGRADED',
        service: 'api-gateway',
        services: serviceHealth,
    };
    res.status(allHealthy ? 200 : 503).json(health);
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=health.js.map