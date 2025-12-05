"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMessageHandlers = void 0;
const message_service_1 = __importDefault(require("../../services/message.service"));
const libs_1 = require("@foodie/libs");
const registerMessageHandlers = (io, socket) => {
    socket.on('message:send', async (data) => {
        try {
            const userId = socket.userId;
            const message = await message_service_1.default.createMessage(userId, {
                channelId: data.channelId,
                conversationId: data.conversationId,
                content: data.content,
                type: data.type || 'text',
                attachments: data.attachments,
                mentions: data.mentions,
                replyTo: data.replyTo,
            });
            const room = data.channelId ? `channel:${data.channelId}` : `conversation:${data.conversationId}`;
            io.to(room).emit('message:new', message);
            if (data.mentions && data.mentions.length > 0) {
                data.mentions.forEach((userId) => {
                    io.to(`user:${userId}`).emit('notification:mention', {
                        messageId: message._id,
                        channelId: data.channelId,
                        conversationId: data.conversationId,
                        sender: userId,
                    });
                });
            }
        }
        catch (error) {
            libs_1.logger.error('Error sending message:', error);
            socket.emit('message:error', { error: 'Failed to send message' });
        }
    });
    socket.on('message:edit', async (data) => {
        try {
            const userId = socket.userId;
            const message = await message_service_1.default.updateMessage(data.messageId, userId, { content: data.content });
            const room = message.channelId
                ? `channel:${message.channelId}`
                : `conversation:${message.conversationId}`;
            io.to(room).emit('message:updated', message);
        }
        catch (error) {
            libs_1.logger.error('Error editing message:', error);
            socket.emit('message:error', { error: 'Failed to edit message' });
        }
    });
    socket.on('message:delete', async (data) => {
        try {
            const userId = socket.userId;
            const message = await message_service_1.default.getMessageById(data.messageId, userId);
            await message_service_1.default.deleteMessage(data.messageId, userId);
            const room = message.channelId
                ? `channel:${message.channelId}`
                : `conversation:${message.conversationId}`;
            io.to(room).emit('message:deleted', { messageId: data.messageId });
        }
        catch (error) {
            libs_1.logger.error('Error deleting message:', error);
            socket.emit('message:error', { error: 'Failed to delete message' });
        }
    });
    socket.on('message:reaction:add', async (data) => {
        try {
            const userId = socket.userId;
            const message = await message_service_1.default.addReaction(data.messageId, userId, data.emoji);
            const room = message.channelId
                ? `channel:${message.channelId}`
                : `conversation:${message.conversationId}`;
            io.to(room).emit('message:reaction:added', {
                messageId: data.messageId,
                reaction: { userId, emoji: data.emoji },
            });
        }
        catch (error) {
            libs_1.logger.error('Error adding reaction:', error);
            socket.emit('message:error', { error: 'Failed to add reaction' });
        }
    });
    socket.on('message:reaction:remove', async (data) => {
        try {
            const userId = socket.userId;
            const message = await message_service_1.default.addReaction(data.messageId, userId, data.emoji);
            const room = message.channelId
                ? `channel:${message.channelId}`
                : `conversation:${message.conversationId}`;
            io.to(room).emit('message:reaction:removed', {
                messageId: data.messageId,
                userId,
                emoji: data.emoji,
            });
        }
        catch (error) {
            libs_1.logger.error('Error removing reaction:', error);
            socket.emit('message:error', { error: 'Failed to remove reaction' });
        }
    });
};
exports.registerMessageHandlers = registerMessageHandlers;
//# sourceMappingURL=message.handler.js.map