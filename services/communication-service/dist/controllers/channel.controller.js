"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelController = void 0;
const libs_1 = require("@foodie/libs");
const channel_service_1 = __importDefault(require("../services/channel.service"));
class ChannelController {
    async getTeamChannels(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { teamId } = req.params;
            const channels = await channel_service_1.default.getTeamChannels(teamId, userId);
            res.json({ success: true, data: channels });
        }
        catch (error) {
            libs_1.logger.error('Error fetching team channels', {
                error: error.message,
                teamId: req.params.teamId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch channels' });
        }
    }
    async getChannelById(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { channelId } = req.params;
            const channel = await channel_service_1.default.getChannelById(channelId, userId);
            res.json({ success: true, data: channel });
        }
        catch (error) {
            libs_1.logger.error('Error fetching channel', {
                error: error.message,
                channelId: req.params.channelId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch channel' });
        }
    }
    async createChannel(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const channelData = req.body;
            const channel = await channel_service_1.default.createChannel(userId, channelData);
            res.status(201).json({ success: true, data: channel });
        }
        catch (error) {
            libs_1.logger.error('Error creating channel', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to create channel' });
        }
    }
    async updateChannel(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { channelId } = req.params;
            const updates = req.body;
            const channel = await channel_service_1.default.updateChannel(channelId, userId, updates);
            res.json({ success: true, data: channel });
        }
        catch (error) {
            libs_1.logger.error('Error updating channel', {
                error: error.message,
                channelId: req.params.channelId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to update channel' });
        }
    }
    async deleteChannel(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { channelId } = req.params;
            await channel_service_1.default.deleteChannel(channelId, userId);
            res.json({ success: true, data: { message: 'Channel deleted successfully' } });
        }
        catch (error) {
            libs_1.logger.error('Error deleting channel', {
                error: error.message,
                channelId: req.params.channelId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to delete channel' });
        }
    }
    async addMember(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { channelId } = req.params;
            const { userId: memberUserId } = req.body;
            const channel = await channel_service_1.default.addMember(channelId, userId, memberUserId);
            res.json({ success: true, data: channel });
        }
        catch (error) {
            libs_1.logger.error('Error adding member to channel', {
                error: error.message,
                channelId: req.params.channelId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to add member to channel' });
        }
    }
    async removeMember(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { channelId, memberId } = req.params;
            const channel = await channel_service_1.default.removeMember(channelId, userId, memberId);
            res.json({ success: true, data: channel });
        }
        catch (error) {
            libs_1.logger.error('Error removing member from channel', {
                error: error.message,
                channelId: req.params.channelId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to remove member from channel' });
        }
    }
}
exports.ChannelController = ChannelController;
exports.default = new ChannelController();
//# sourceMappingURL=channel.controller.js.map