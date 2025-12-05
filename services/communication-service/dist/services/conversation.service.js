"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const libs_1 = require("@foodie/libs");
const models_1 = require("../models");
class ConversationService {
    async getUserConversations(userId) {
        try {
            const conversations = await models_1.Conversation.find({ participants: userId })
                .populate('participants', 'name email avatar')
                .populate('lastMessage')
                .sort({ updatedAt: -1 })
                .lean();
            return conversations;
        }
        catch (error) {
            libs_1.logger.error(`Error getting user conversations: ${error}`);
            throw libs_1.Errors.internalServer();
        }
    }
    async getConversationById(conversationId, userId) {
        try {
            const conversation = await models_1.Conversation.findById(conversationId)
                .populate('participants', 'name email avatar')
                .populate('lastMessage')
                .lean();
            if (!conversation)
                throw libs_1.Errors.notFound('Conversation not found');
            const isParticipant = conversation.participants.some((p) => p._id.toString() === userId);
            if (!isParticipant)
                throw libs_1.Errors.forbidden('You are not a participant in this conversation');
            return conversation;
        }
        catch (error) {
            libs_1.logger.error(`Error fetching conversation: ${error}`);
            throw error;
        }
    }
    async createConversation(userId, participantIds) {
        try {
            const allParticipants = Array.from(new Set([userId, ...participantIds])).map((id) => new mongoose_1.Types.ObjectId(id));
            if (allParticipants.length < 2) {
                throw libs_1.Errors.badRequest('Conversation must have at least 2 participants');
            }
            const existingConversation = await models_1.Conversation.findOne({
                participants: { $all: allParticipants, $size: allParticipants.length },
            })
                .populate('participants', 'name email avatar')
                .populate('lastMessage')
                .lean();
            if (existingConversation) {
                return existingConversation;
            }
            const conversation = new models_1.Conversation({
                participants: allParticipants,
            });
            await conversation.save();
            const populatedConversation = await models_1.Conversation.findById(conversation._id)
                .populate('participants', 'name email avatar')
                .lean();
            return populatedConversation;
        }
        catch (error) {
            libs_1.logger.error(`Error creating conversation: ${error}`);
            if (error instanceof Error && error.name === 'ValidationError') {
                throw libs_1.Errors.badRequest(error.message);
            }
            throw error;
        }
    }
    async deleteConversation(conversationId, userId) {
        try {
            const conversation = await models_1.Conversation.findById(conversationId);
            if (!conversation)
                throw libs_1.Errors.notFound('Conversation not found');
            const isParticipant = conversation.participants.some((p) => p.toString() === userId);
            if (!isParticipant)
                throw libs_1.Errors.forbidden('You are not a participant in this conversation');
            await models_1.Message.deleteMany({ conversationId });
            await models_1.Conversation.findByIdAndDelete(conversationId);
        }
        catch (error) {
            libs_1.logger.error(`Error deleting conversation: ${error}`);
            throw error;
        }
    }
    async addParticipant(conversationId, userId, newParticipantId) {
        try {
            const conversation = await models_1.Conversation.findById(conversationId);
            if (!conversation)
                throw libs_1.Errors.notFound('Conversation not found');
            const isParticipant = conversation.participants.some((p) => p.toString() === userId);
            if (!isParticipant)
                throw libs_1.Errors.forbidden('You are not a participant in this conversation');
            if (conversation.participants.some((p) => p.toString() === newParticipantId)) {
                throw libs_1.Errors.badRequest('User is already a participant in this conversation');
            }
            conversation.participants.push(new mongoose_1.Types.ObjectId(newParticipantId));
            await conversation.save();
            const updatedConversation = await models_1.Conversation.findById(conversationId)
                .populate('participants', 'name email avatar')
                .populate('lastMessage')
                .lean();
            return updatedConversation;
        }
        catch (error) {
            libs_1.logger.error(`Error adding participant to conversation: ${error}`);
            throw error;
        }
    }
    async removeParticipant(conversationId, userId, participantId) {
        try {
            const conversation = await models_1.Conversation.findById(conversationId);
            if (!conversation)
                throw libs_1.Errors.notFound('Conversation not found');
            const isParticipant = conversation.participants.some((p) => p.toString() === userId);
            if (!isParticipant)
                throw libs_1.Errors.forbidden('You are not a participant in this conversation');
            if (userId !== participantId &&
                conversation.participants[0].toString() !== userId) {
                throw libs_1.Errors.forbidden('You can only remove yourself from this conversation');
            }
            conversation.participants = conversation.participants.filter((p) => p.toString() !== participantId);
            if (conversation.participants.length < 2) {
                await models_1.Message.deleteMany({ conversationId });
                await models_1.Conversation.findByIdAndDelete(conversationId);
                return null;
            }
            await conversation.save();
            const updatedConversation = await models_1.Conversation.findById(conversationId)
                .populate('participants', 'name email avatar')
                .populate('lastMessage')
                .lean();
            return updatedConversation;
        }
        catch (error) {
            libs_1.logger.error(`Error removing participant from conversation: ${error}`);
            throw error;
        }
    }
    async findOrCreateDirectConversation(userId, otherUserId) {
        try {
            if (userId === otherUserId) {
                throw libs_1.Errors.badRequest('Cannot create conversation with yourself');
            }
            const participants = [
                new mongoose_1.Types.ObjectId(userId),
                new mongoose_1.Types.ObjectId(otherUserId),
            ];
            const existingConversation = await models_1.Conversation.findOne({
                participants: { $all: participants, $size: 2 },
            })
                .populate('participants', 'name email avatar')
                .populate('lastMessage')
                .lean();
            if (existingConversation) {
                return existingConversation;
            }
            const conversation = new models_1.Conversation({ participants });
            await conversation.save();
            const populatedConversation = await models_1.Conversation.findById(conversation._id)
                .populate('participants', 'name email avatar')
                .lean();
            return populatedConversation;
        }
        catch (error) {
            libs_1.logger.error(`Error finding or creating direct conversation: ${error}`);
            throw error;
        }
    }
}
exports.default = new ConversationService();
//# sourceMappingURL=conversation.service.js.map