"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTypingHandlers = void 0;
const registerTypingHandlers = (_io, socket) => {
    socket.on('typing:start', (data) => {
        const userId = socket.userId;
        const room = data.channelId ? `channel:${data.channelId}` : `conversation:${data.conversationId}`;
        socket.to(room).emit('typing:user-started', {
            userId,
            channelId: data.channelId,
            conversationId: data.conversationId,
        });
    });
    socket.on('typing:stop', (data) => {
        const userId = socket.userId;
        const room = data.channelId ? `channel:${data.channelId}` : `conversation:${data.conversationId}`;
        socket.to(room).emit('typing:user-stopped', {
            userId,
            channelId: data.channelId,
            conversationId: data.conversationId,
        });
    });
};
exports.registerTypingHandlers = registerTypingHandlers;
//# sourceMappingURL=typing.handler.js.map