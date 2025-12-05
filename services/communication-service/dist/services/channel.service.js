"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const libs_1 = require("@foodie/libs");
const models_1 = require("../models");
class ChannelService {
    async getTeamChannels(teamId, userId) {
        try {
            const team = await models_1.Team.findById(teamId);
            if (!team)
                throw libs_1.Errors.notFound('Team not found');
            const isMember = team.members.some((m) => m.toString() === userId);
            if (!isMember)
                throw libs_1.Errors.forbidden('You are not a member of this team');
            const channels = await models_1.Channel.find({ teamId })
                .populate('lastMessage')
                .sort({ createdAt: 1 })
                .lean();
            const filteredChannels = channels.filter((channel) => {
                if (!channel.isPrivate)
                    return true;
                return channel.members.some((m) => m.toString() === userId);
            });
            return filteredChannels;
        }
        catch (error) {
            libs_1.logger.error(`Error getting team channels: ${error}`);
            throw error;
        }
    }
    async getChannelById(channelId, userId) {
        try {
            const channel = await models_1.Channel.findById(channelId)
                .populate('teamId')
                .populate('lastMessage')
                .lean();
            if (!channel)
                throw libs_1.Errors.notFound('Channel not found');
            const team = await models_1.Team.findById(channel.teamId);
            if (!team)
                throw libs_1.Errors.notFound('Team not found');
            const isTeamMember = team.members.some((m) => m.toString() === userId);
            if (!isTeamMember)
                throw libs_1.Errors.forbidden('You are not a member of this team');
            if (channel.isPrivate) {
                const isChannelMember = channel.members.some((m) => m._id.toString() === userId);
                if (!isChannelMember)
                    throw libs_1.Errors.forbidden('You do not have access to this private channel');
            }
            return channel;
        }
        catch (error) {
            libs_1.logger.error(`Error fetching channel: ${error}`);
            throw error;
        }
    }
    async createChannel(userId, data) {
        try {
            const team = await models_1.Team.findById(data.teamId);
            if (!team)
                throw libs_1.Errors.notFound('Team not found');
            if (team.owner.toString() !== userId)
                throw libs_1.Errors.forbidden('Only the team owner can create channels');
            const channel = new models_1.Channel({
                ...data,
                members: data.isPrivate ? [userId] : team.members,
            });
            await channel.save();
            team.channels.push(channel._id);
            await team.save();
            const populatedChannel = await models_1.Channel.findById(channel._id)
                .populate('teamId')
                .lean();
            return populatedChannel;
        }
        catch (error) {
            libs_1.logger.error(`Error creating channel: ${error}`);
            if (error instanceof Error && error.name === 'ValidationError') {
                throw libs_1.Errors.badRequest(error.message);
            }
            throw error;
        }
    }
    async updateChannel(channelId, userId, data) {
        try {
            const channel = await models_1.Channel.findById(channelId);
            if (!channel)
                throw libs_1.Errors.notFound('Channel not found');
            const team = await models_1.Team.findById(channel.teamId);
            if (!team)
                throw libs_1.Errors.notFound('Team not found');
            if (team.owner.toString() !== userId)
                throw libs_1.Errors.forbidden('Only the team owner can update channels');
            Object.assign(channel, data);
            await channel.save();
            const updatedChannel = await models_1.Channel.findById(channelId)
                .populate('teamId')
                .populate('lastMessage')
                .lean();
            return updatedChannel;
        }
        catch (error) {
            libs_1.logger.error(`Error updating channel: ${error}`);
            throw error;
        }
    }
    async deleteChannel(channelId, userId) {
        try {
            const channel = await models_1.Channel.findById(channelId);
            if (!channel)
                throw libs_1.Errors.notFound('Channel not found');
            const team = await models_1.Team.findById(channel.teamId);
            if (!team)
                throw libs_1.Errors.notFound('Team not found');
            if (team.owner.toString() !== userId)
                throw libs_1.Errors.forbidden('Only the team owner can delete channels');
            team.channels = team.channels.filter((c) => c.toString() !== channelId);
            await team.save();
            await models_1.Message.deleteMany({ channelId });
            await models_1.Channel.findByIdAndDelete(channelId);
        }
        catch (error) {
            libs_1.logger.error(`Error deleting channel: ${error}`);
            throw error;
        }
    }
    async addMember(channelId, userId, memberUserId) {
        try {
            const channel = await models_1.Channel.findById(channelId);
            if (!channel)
                throw libs_1.Errors.notFound('Channel not found');
            const team = await models_1.Team.findById(channel.teamId);
            if (!team)
                throw libs_1.Errors.notFound('Team not found');
            if (team.owner.toString() !== userId)
                throw libs_1.Errors.forbidden('Only the team owner can add members to channels');
            const isTeamMember = team.members.some((m) => m.toString() === memberUserId);
            if (!isTeamMember)
                throw libs_1.Errors.badRequest('User is not a member of the team');
            if (channel.members.some((m) => m.toString() === memberUserId)) {
                throw libs_1.Errors.badRequest('User is already a member of this channel');
            }
            channel.members.push(new mongoose_1.Types.ObjectId(memberUserId));
            await channel.save();
            const updatedChannel = await models_1.Channel.findById(channelId)
                .populate('teamId')
                .lean();
            return updatedChannel;
        }
        catch (error) {
            libs_1.logger.error(`Error adding member to channel: ${error}`);
            throw error;
        }
    }
    async removeMember(channelId, userId, memberUserId) {
        try {
            const channel = await models_1.Channel.findById(channelId);
            if (!channel)
                throw libs_1.Errors.notFound('Channel not found');
            const team = await models_1.Team.findById(channel.teamId);
            if (!team)
                throw libs_1.Errors.notFound('Team not found');
            if (team.owner.toString() !== userId)
                throw libs_1.Errors.forbidden('Only the team owner can remove members from channels');
            channel.members = channel.members.filter((m) => m.toString() !== memberUserId);
            await channel.save();
            const updatedChannel = await models_1.Channel.findById(channelId)
                .populate('teamId')
                .lean();
            return updatedChannel;
        }
        catch (error) {
            libs_1.logger.error(`Error removing member from channel: ${error}`);
            throw error;
        }
    }
}
exports.default = new ChannelService();
//# sourceMappingURL=channel.service.js.map