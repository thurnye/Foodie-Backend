"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const libs_1 = require("@foodie/libs");
const message_service_1 = __importDefault(require("../services/message.service"));
class MessageController {
    async getChannelMessages(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { channelId } = req.params;
            const { page, limit } = req.query;
            const messages = await message_service_1.default.getChannelMessages(channelId, userId, page ? parseInt(page) : undefined, limit ? parseInt(limit) : undefined);
            res.json({ success: true, data: messages });
        }
        catch (error) {
            libs_1.logger.error('Error fetching channel messages', {
                error: error.message,
                channelId: req.params.channelId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch messages' });
        }
    }
    async getConversationMessages(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { conversationId } = req.params;
            const { page, limit } = req.query;
            const messages = await message_service_1.default.getConversationMessages(conversationId, userId, page ? parseInt(page) : undefined, limit ? parseInt(limit) : undefined);
            res.json({ success: true, data: messages });
        }
        catch (error) {
            libs_1.logger.error('Error fetching conversation messages', {
                error: error.message,
                conversationId: req.params.conversationId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch messages' });
        }
    }
    async getMessageById(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { messageId } = req.params;
            const message = await message_service_1.default.getMessageById(messageId, userId);
            res.json({ success: true, data: message });
        }
        catch (error) {
            libs_1.logger.error('Error fetching message', {
                error: error.message,
                messageId: req.params.messageId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch message' });
        }
    }
    async createMessage(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const messageData = req.body;
            const message = await message_service_1.default.createMessage(userId, messageData);
            res.status(201).json({ success: true, data: message });
        }
        catch (error) {
            libs_1.logger.error('Error creating message', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to create message' });
        }
    }
    async updateMessage(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { messageId } = req.params;
            const updates = req.body;
            const message = await message_service_1.default.updateMessage(messageId, userId, updates);
            res.json({ success: true, data: message });
        }
        catch (error) {
            libs_1.logger.error('Error updating message', {
                error: error.message,
                messageId: req.params.messageId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to update message' });
        }
    }
    async deleteMessage(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { messageId } = req.params;
            await message_service_1.default.deleteMessage(messageId, userId);
            res.json({ success: true, data: { message: 'Message deleted successfully' } });
        }
        catch (error) {
            libs_1.logger.error('Error deleting message', {
                error: error.message,
                messageId: req.params.messageId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to delete message' });
        }
    }
    async addReaction(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { messageId } = req.params;
            const { emoji } = req.body;
            const message = await message_service_1.default.addReaction(messageId, userId, emoji);
            res.json({ success: true, data: message });
        }
        catch (error) {
            libs_1.logger.error('Error adding reaction to message', {
                error: error.message,
                messageId: req.params.messageId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to add reaction' });
        }
    }
}
exports.MessageController = MessageController;
exports.default = new MessageController();
//# sourceMappingURL=message.controller.js.map