"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsHandler = void 0;
const metricsHandler = (_req, res) => {
    const metrics = `
# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${process.uptime()}

# HELP process_memory_bytes Process memory usage in bytes
# TYPE process_memory_bytes gauge
process_memory_bytes{type="rss"} ${process.memoryUsage().rss}
process_memory_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}
process_memory_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}

# TODO: Add request count, error rate, latency metrics
  `.trim();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
};
exports.metricsHandler = metricsHandler;
//# sourceMappingURL=metrics.js.map