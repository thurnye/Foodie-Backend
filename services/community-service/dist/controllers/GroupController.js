"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupController = void 0;
const libs_1 = require("@foodie/libs");
const GroupService_1 = __importDefault(require("../services/GroupService"));
class GroupController {
    async getAllGroups(req, res) {
        try {
            const { search, tags, isPrivate, sort = 'newest' } = req.query;
            const groups = await GroupService_1.default.getAllGroups({
                search: search,
                tags: tags,
                isPrivate: isPrivate === 'true' ? true : isPrivate === 'false' ? false : undefined,
                sort: sort,
            });
            res.json({ success: true, data: groups });
        }
        catch (error) {
            libs_1.logger.error('Error fetching groups', { error: error.message });
            res.status(500).json({ success: false, message: 'Failed to fetch groups' });
        }
    }
    async getGroupById(req, res) {
        try {
            const { groupId } = req.params;
            const group = await GroupService_1.default.getGroupById(groupId);
            res.json({ success: true, data: group });
        }
        catch (error) {
            libs_1.logger.error('Error fetching group', { error: error.message, groupId: req.params.groupId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to fetch group' });
        }
    }
    async createGroup(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { name, description, coverImage, icon, isPrivate, tags, rules } = req.body;
            const group = await GroupService_1.default.createGroup(userId, {
                name,
                description,
                coverImage,
                icon,
                isPrivate,
                tags,
                rules,
            });
            res.status(201).json({ success: true, data: group });
        }
        catch (error) {
            libs_1.logger.error('Error creating group', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to create group' });
        }
    }
    async updateGroup(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { groupId } = req.params;
            const updates = req.body;
            const group = await GroupService_1.default.updateGroup(groupId, userId, updates);
            res.json({ success: true, data: group });
        }
        catch (error) {
            libs_1.logger.error('Error updating group', { error: error.message, groupId: req.params.groupId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to update group' });
        }
    }
    async deleteGroup(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { groupId } = req.params;
            await GroupService_1.default.deleteGroup(groupId, userId);
            res.json({ success: true, message: 'Group deleted successfully' });
        }
        catch (error) {
            libs_1.logger.error('Error deleting group', { error: error.message, groupId: req.params.groupId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to delete group' });
        }
    }
    async joinGroup(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { groupId } = req.params;
            const group = await GroupService_1.default.joinGroup(groupId, userId);
            res.json({ success: true, data: group });
        }
        catch (error) {
            libs_1.logger.error('Error joining group', { error: error.message, groupId: req.params.groupId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to join group' });
        }
    }
    async leaveGroup(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { groupId } = req.params;
            await GroupService_1.default.leaveGroup(groupId, userId);
            res.json({ success: true, message: 'Left group successfully' });
        }
        catch (error) {
            libs_1.logger.error('Error leaving group', { error: error.message, groupId: req.params.groupId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to leave group' });
        }
    }
    async getMyGroups(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const groups = await GroupService_1.default.getMyGroups(userId);
            res.json({ success: true, data: groups });
        }
        catch (error) {
            libs_1.logger.error('Error fetching user groups', { error: error.message });
            res.status(500).json({ success: false, message: 'Failed to fetch your groups' });
        }
    }
    async cancelJoinRequest(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { groupId } = req.params;
            const group = await GroupService_1.default.cancelJoinRequest(groupId, userId);
            res.json({ success: true, data: group });
        }
        catch (error) {
            libs_1.logger.error('Error cancelling join request', { error: error.message, groupId: req.params.groupId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to cancel join request' });
        }
    }
    async approveJoinRequest(req, res) {
        try {
            const adminUserId = req.headers['x-user-id'];
            const { groupId, userId } = req.params;
            const group = await GroupService_1.default.approveJoinRequest(groupId, adminUserId, userId);
            res.json({ success: true, data: group });
        }
        catch (error) {
            libs_1.logger.error('Error approving join request', { error: error.message, groupId: req.params.groupId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to approve join request' });
        }
    }
    async rejectJoinRequest(req, res) {
        try {
            const adminUserId = req.headers['x-user-id'];
            const { groupId, userId } = req.params;
            const group = await GroupService_1.default.rejectJoinRequest(groupId, adminUserId, userId);
            res.json({ success: true, data: group });
        }
        catch (error) {
            libs_1.logger.error('Error rejecting join request', { error: error.message, groupId: req.params.groupId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to reject join request' });
        }
    }
}
exports.GroupController = GroupController;
exports.default = new GroupController();
//# sourceMappingURL=GroupController.js.map