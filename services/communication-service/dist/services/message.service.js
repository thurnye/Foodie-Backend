"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const libs_1 = require("@foodie/libs");
const models_1 = require("../models");
class MessageService {
    async getChannelMessages(channelId, userId, page = 1, limit = 50) {
        try {
            const channel = await models_1.Channel.findById(channelId).populate('teamId');
            if (!channel)
                throw libs_1.Errors.notFound('Channel not found');
            const team = channel.teamId;
            const isTeamMember = team.members.some((m) => m.toString() === userId);
            if (!isTeamMember)
                throw libs_1.Errors.forbidden('You are not a member of this team');
            if (channel.isPrivate) {
                const isChannelMember = channel.members.some((m) => m.toString() === userId);
                if (!isChannelMember)
                    throw libs_1.Errors.forbidden('You do not have access to this private channel');
            }
            const messages = await models_1.Message.find({ channelId, isDeleted: false })
                .populate('sender', 'name email avatar')
                .populate('replyTo')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
            const total = await models_1.Message.countDocuments({ channelId, isDeleted: false });
            return {
                messages: messages.reverse(),
                total,
                page,
                pages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            libs_1.logger.error(`Error getting channel messages: ${error}`);
            throw error;
        }
    }
    async getConversationMessages(conversationId, userId, page = 1, limit = 50) {
        try {
            const conversation = await models_1.Conversation.findById(conversationId);
            if (!conversation)
                throw libs_1.Errors.notFound('Conversation not found');
            const isParticipant = conversation.participants.some((p) => p.toString() === userId);
            if (!isParticipant)
                throw libs_1.Errors.forbidden('You are not a participant in this conversation');
            const messages = await models_1.Message.find({ conversationId, isDeleted: false })
                .populate('sender', 'name email avatar')
                .populate('replyTo')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
            const total = await models_1.Message.countDocuments({ conversationId, isDeleted: false });
            return {
                messages: messages.reverse(),
                total,
                page,
                pages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            libs_1.logger.error(`Error getting conversation messages: ${error}`);
            throw error;
        }
    }
    async getMessageById(messageId, userId) {
        try {
            const message = await models_1.Message.findById(messageId)
                .populate('sender', 'name email avatar')
                .populate('replyTo')
                .lean();
            if (!message)
                throw libs_1.Errors.notFound('Message not found');
            if (message.isDeleted)
                throw libs_1.Errors.notFound('Message has been deleted');
            if (message.channelId) {
                const channel = await models_1.Channel.findById(message.channelId).populate('teamId');
                if (!channel)
                    throw libs_1.Errors.notFound('Channel not found');
                const team = channel.teamId;
                const isTeamMember = team.members.some((m) => m.toString() === userId);
                if (!isTeamMember)
                    throw libs_1.Errors.forbidden('Access denied');
                if (channel.isPrivate) {
                    const isChannelMember = channel.members.some((m) => m.toString() === userId);
                    if (!isChannelMember)
                        throw libs_1.Errors.forbidden('Access denied');
                }
            }
            else if (message.conversationId) {
                const conversation = await models_1.Conversation.findById(message.conversationId);
                if (!conversation)
                    throw libs_1.Errors.notFound('Conversation not found');
                const isParticipant = conversation.participants.some((p) => p.toString() === userId);
                if (!isParticipant)
                    throw libs_1.Errors.forbidden('Access denied');
            }
            return message;
        }
        catch (error) {
            libs_1.logger.error(`Error fetching message: ${error}`);
            throw error;
        }
    }
    async createMessage(userId, data) {
        try {
            if (data.channelId) {
                const channel = await models_1.Channel.findById(data.channelId).populate('teamId');
                if (!channel)
                    throw libs_1.Errors.notFound('Channel not found');
                const team = channel.teamId;
                const isTeamMember = team.members.some((m) => m.toString() === userId);
                if (!isTeamMember)
                    throw libs_1.Errors.forbidden('You are not a member of this team');
                if (channel.isPrivate) {
                    const isChannelMember = channel.members.some((m) => m.toString() === userId);
                    if (!isChannelMember)
                        throw libs_1.Errors.forbidden('You do not have access to this private channel');
                }
                const message = new models_1.Message({
                    ...data,
                    sender: userId,
                    mentions: data.mentions?.map((id) => new mongoose_1.Types.ObjectId(id)),
                });
                await message.save();
                channel.lastMessage = message._id;
                await channel.save();
                const populatedMessage = await models_1.Message.findById(message._id)
                    .populate('sender', 'name email avatar')
                    .populate('replyTo')
                    .lean();
                return populatedMessage;
            }
            else if (data.conversationId) {
                const conversation = await models_1.Conversation.findById(data.conversationId);
                if (!conversation)
                    throw libs_1.Errors.notFound('Conversation not found');
                const isParticipant = conversation.participants.some((p) => p.toString() === userId);
                if (!isParticipant)
                    throw libs_1.Errors.forbidden('You are not a participant in this conversation');
                const message = new models_1.Message({
                    ...data,
                    sender: userId,
                    mentions: data.mentions?.map((id) => new mongoose_1.Types.ObjectId(id)),
                });
                await message.save();
                conversation.lastMessage = message._id;
                await conversation.save();
                const populatedMessage = await models_1.Message.findById(message._id)
                    .populate('sender', 'name email avatar')
                    .populate('replyTo')
                    .lean();
                return populatedMessage;
            }
            else {
                throw libs_1.Errors.badRequest('Message must belong to either a channel or a conversation');
            }
        }
        catch (error) {
            libs_1.logger.error(`Error creating message: ${error}`);
            if (error instanceof Error && error.name === 'ValidationError') {
                throw libs_1.Errors.badRequest(error.message);
            }
            throw error;
        }
    }
    async updateMessage(messageId, userId, data) {
        try {
            const message = await models_1.Message.findById(messageId);
            if (!message)
                throw libs_1.Errors.notFound('Message not found');
            if (message.isDeleted)
                throw libs_1.Errors.notFound('Message has been deleted');
            if (message.sender.toString() !== userId)
                throw libs_1.Errors.forbidden('You can only edit your own messages');
            message.content = data.content;
            message.isEdited = true;
            await message.save();
            const updatedMessage = await models_1.Message.findById(messageId)
                .populate('sender', 'name email avatar')
                .populate('replyTo')
                .lean();
            return updatedMessage;
        }
        catch (error) {
            libs_1.logger.error(`Error updating message: ${error}`);
            throw error;
        }
    }
    async deleteMessage(messageId, userId) {
        try {
            const message = await models_1.Message.findById(messageId);
            if (!message)
                throw libs_1.Errors.notFound('Message not found');
            if (message.isDeleted)
                throw libs_1.Errors.notFound('Message has already been deleted');
            if (message.sender.toString() !== userId)
                throw libs_1.Errors.forbidden('You can only delete your own messages');
            message.isDeleted = true;
            message.content = '[Message deleted]';
            await message.save();
        }
        catch (error) {
            libs_1.logger.error(`Error deleting message: ${error}`);
            throw error;
        }
    }
    async addReaction(messageId, userId, emoji) {
        try {
            const message = await models_1.Message.findById(messageId);
            if (!message)
                throw libs_1.Errors.notFound('Message not found');
            if (message.isDeleted)
                throw libs_1.Errors.notFound('Message has been deleted');
            const existingReaction = message.reactions?.find((r) => r.emoji === emoji);
            if (existingReaction) {
                const userAlreadyReacted = existingReaction.users.some((u) => u.toString() === userId);
                if (userAlreadyReacted) {
                    existingReaction.users = existingReaction.users.filter((u) => u.toString() !== userId);
                    existingReaction.count = existingReaction.users.length;
                    if (existingReaction.count === 0) {
                        message.reactions = message.reactions?.filter((r) => r.emoji !== emoji);
                    }
                }
                else {
                    existingReaction.users.push(new mongoose_1.Types.ObjectId(userId));
                    existingReaction.count = existingReaction.users.length;
                }
            }
            else {
                if (!message.reactions)
                    message.reactions = [];
                message.reactions.push({
                    emoji,
                    users: [new mongoose_1.Types.ObjectId(userId)],
                    count: 1,
                });
            }
            await message.save();
            const updatedMessage = await models_1.Message.findById(messageId)
                .populate('sender', 'name email avatar')
                .populate('replyTo')
                .lean();
            return updatedMessage;
        }
        catch (error) {
            libs_1.logger.error(`Error adding reaction to message: ${error}`);
            throw error;
        }
    }
}
exports.default = new MessageService();
//# sourceMappingURL=message.service.js.map