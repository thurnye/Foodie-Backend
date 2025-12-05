"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocket = void 0;
const socket_io_1 = require("socket.io");
const libs_1 = require("@foodie/libs");
const message_handler_1 = require("./handlers/message.handler");
const typing_handler_1 = require("./handlers/typing.handler");
const status_handler_1 = require("./handlers/status.handler");
const initializeWebSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const userId = socket.handshake.auth.userId || socket.handshake.headers['x-user-id'];
        if (!userId) {
            return next(new Error('Authentication error'));
        }
        socket.userId = userId;
        next();
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        libs_1.logger.info(`User connected: ${userId}`);
        socket.join(`user:${userId}`);
        (0, message_handler_1.registerMessageHandlers)(io, socket);
        (0, typing_handler_1.registerTypingHandlers)(io, socket);
        (0, status_handler_1.registerStatusHandlers)(io, socket);
        socket.on('disconnect', () => {
            libs_1.logger.info(`User disconnected: ${userId}`);
            io.emit('status:user-changed', {
                userId,
                status: 'offline',
            });
        });
    });
    libs_1.logger.info('WebSocket server initialized');
    return io;
};
exports.initializeWebSocket = initializeWebSocket;
//# sourceMappingURL=index.js.map