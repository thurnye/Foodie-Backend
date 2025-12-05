"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationController = void 0;
const libs_1 = require("@foodie/libs");
const conversation_service_1 = __importDefault(require("../services/conversation.service"));
class ConversationController {
    async getUserConversations(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const conversations = await conversation_service_1.default.getUserConversations(userId);
            res.json({ success: true, data: conversations });
        }
        catch (error) {
            libs_1.logger.error('Error fetching user conversations', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
        }
    }
    async getConversationById(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { conversationId } = req.params;
            const conversation = await conversation_service_1.default.getConversationById(conversationId, userId);
            res.json({ success: true, data: conversation });
        }
        catch (error) {
            libs_1.logger.error('Error fetching conversation', {
                error: error.message,
                conversationId: req.params.conversationId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
        }
    }
    async createConversation(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { participants } = req.body;
            const conversation = await conversation_service_1.default.createConversation(userId, participants);
            res.status(201).json({ success: true, data: conversation });
        }
        catch (error) {
            libs_1.logger.error('Error creating conversation', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to create conversation' });
        }
    }
    async deleteConversation(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { conversationId } = req.params;
            await conversation_service_1.default.deleteConversation(conversationId, userId);
            res.json({ success: true, data: { message: 'Conversation deleted successfully' } });
        }
        catch (error) {
            libs_1.logger.error('Error deleting conversation', {
                error: error.message,
                conversationId: req.params.conversationId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to delete conversation' });
        }
    }
    async addParticipant(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { conversationId } = req.params;
            const { userId: participantId } = req.body;
            const conversation = await conversation_service_1.default.addParticipant(conversationId, userId, participantId);
            res.json({ success: true, data: conversation });
        }
        catch (error) {
            libs_1.logger.error('Error adding participant to conversation', {
                error: error.message,
                conversationId: req.params.conversationId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to add participant' });
        }
    }
    async removeParticipant(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { conversationId, participantId } = req.params;
            const conversation = await conversation_service_1.default.removeParticipant(conversationId, userId, participantId);
            res.json({ success: true, data: conversation });
        }
        catch (error) {
            libs_1.logger.error('Error removing participant from conversation', {
                error: error.message,
                conversationId: req.params.conversationId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to remove participant' });
        }
    }
    async findOrCreateDirectConversation(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { otherUserId } = req.body;
            const conversation = await conversation_service_1.default.findOrCreateDirectConversation(userId, otherUserId);
            res.json({ success: true, data: conversation });
        }
        catch (error) {
            libs_1.logger.error('Error finding or creating direct conversation', {
                error: error.message,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, error: 'Failed to find or create conversation' });
        }
    }
}
exports.ConversationController = ConversationController;
exports.default = new ConversationController();
//# sourceMappingURL=conversation.controller.js.map