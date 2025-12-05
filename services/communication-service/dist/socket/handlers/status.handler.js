"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStatusHandlers = void 0;
const registerStatusHandlers = (io, socket) => {
    socket.on('status:change', (data) => {
        const userId = socket.userId;
        io.emit('status:user-changed', {
            userId,
            status: data.status,
        });
    });
    socket.on('channel:join', (data) => {
        socket.join(`channel:${data.channelId}`);
    });
    socket.on('channel:leave', (data) => {
        socket.leave(`channel:${data.channelId}`);
    });
    socket.on('conversation:join', (data) => {
        socket.join(`conversation:${data.conversationId}`);
    });
    socket.on('conversation:leave', (data) => {
        socket.leave(`conversation:${data.conversationId}`);
    });
};
exports.registerStatusHandlers = registerStatusHandlers;
//# sourceMappingURL=status.handler.js.map