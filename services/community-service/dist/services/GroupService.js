"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const libs_1 = require("@foodie/libs");
const Group_model_1 = require("../models/Group.model");
const Post_model_1 = require("../models/Post.model");
const userClient_1 = require("../utils/userClient");
class GroupService {
    async getAllGroups(filters = {}) {
        try {
            const { search, tags, isPrivate: _isPrivate, sort = 'newest' } = filters;
            let query = {};
            if (search) {
                query.$text = { $search: search };
            }
            if (tags) {
                const tagArray = tags.split(',');
                query.tags = { $in: tagArray };
            }
            let sortQuery = {};
            switch (sort) {
                case 'popular':
                    sortQuery = { memberCount: -1 };
                    break;
                case 'name':
                    sortQuery = { name: 1 };
                    break;
                default:
                    sortQuery = { createdAt: -1 };
            }
            const groups = await Group_model_1.Group.find(query)
                .sort(sortQuery)
                .lean();
            const groupsWithUsers = await Promise.all(groups.map(async (group) => {
                const creator = await (0, userClient_1.fetchUserData)(group.creator.toString());
                return {
                    ...group,
                    creator: creator || group.creator,
                };
            }));
            libs_1.logger.info('Groups fetched', { count: groupsWithUsers.length });
            return groupsWithUsers;
        }
        catch (error) {
            libs_1.logger.error('Error fetching groups', { error });
            throw error;
        }
    }
    async getGroupById(groupId) {
        try {
            const group = await Group_model_1.Group.findById(groupId).lean();
            if (!group) {
                throw libs_1.Errors.notFound('Group not found');
            }
            const creator = await (0, userClient_1.fetchUserData)(group.creator.toString());
            const membersWithUsers = await Promise.all(group.members.map(async (member) => {
                const user = await (0, userClient_1.fetchUserData)(member.user.toString());
                return {
                    ...member,
                    user: user || member.user,
                };
            }));
            const groupWithUsers = {
                ...group,
                creator: creator || group.creator,
                members: membersWithUsers,
            };
            libs_1.logger.info('Group fetched', { groupId });
            return groupWithUsers;
        }
        catch (error) {
            libs_1.logger.error('Error fetching group', { error, groupId });
            throw error;
        }
    }
    async createGroup(userId, data) {
        try {
            const { name, description, coverImage, icon, isPrivate, tags, rules } = data;
            const group = await Group_model_1.Group.create({
                name,
                description,
                coverImage,
                icon,
                isPrivate: isPrivate || false,
                creator: userId,
                tags: tags || [],
                rules: rules || [],
            });
            const createdGroup = await Group_model_1.Group.findById(group._id).lean();
            const creator = await (0, userClient_1.fetchUserData)(userId);
            const groupWithCreator = {
                ...createdGroup,
                creator: creator || userId,
            };
            libs_1.logger.info('Group created', { groupId: group._id, userId });
            return groupWithCreator;
        }
        catch (error) {
            libs_1.logger.error('Error creating group', { error, userId });
            throw error;
        }
    }
    async updateGroup(groupId, userId, updates) {
        try {
            const group = await Group_model_1.Group.findById(groupId);
            if (!group) {
                throw libs_1.Errors.notFound('Group not found');
            }
            const member = group.members.find(m => m.user.toString() === userId);
            if (!member || member.role !== 'admin') {
                throw libs_1.Errors.forbidden('Only group admins can update the group');
            }
            Object.assign(group, updates);
            await group.save();
            const updatedGroup = await Group_model_1.Group.findById(groupId).lean();
            const creator = await (0, userClient_1.fetchUserData)(updatedGroup.creator.toString());
            const groupWithCreator = {
                ...updatedGroup,
                creator: creator || updatedGroup.creator,
            };
            libs_1.logger.info('Group updated', { groupId, userId });
            return groupWithCreator;
        }
        catch (error) {
            libs_1.logger.error('Error updating group', { error, groupId });
            throw error;
        }
    }
    async deleteGroup(groupId, userId) {
        try {
            const group = await Group_model_1.Group.findById(groupId);
            if (!group) {
                throw libs_1.Errors.notFound('Group not found');
            }
            if (group.creator.toString() !== userId) {
                throw libs_1.Errors.forbidden('Only the group creator can delete the group');
            }
            await Post_model_1.Post.deleteMany({ group: groupId });
            await group.deleteOne();
            libs_1.logger.info('Group deleted', { groupId, userId });
        }
        catch (error) {
            libs_1.logger.error('Error deleting group', { error, groupId });
            throw error;
        }
    }
    async joinGroup(groupId, userId) {
        try {
            const group = await Group_model_1.Group.findById(groupId);
            if (!group) {
                throw libs_1.Errors.notFound('Group not found');
            }
            const existingMember = group.members.find(m => m.user.toString() === userId);
            if (existingMember) {
                throw libs_1.Errors.badRequest('Already a member of this group');
            }
            if (group.isPrivate) {
                const existingRequest = group.joinRequest.find(req => req.toString() === userId);
                if (existingRequest) {
                    throw libs_1.Errors.badRequest('Join request already sent');
                }
                group.joinRequest.push(userId);
                await group.save();
                const updatedGroup = await Group_model_1.Group.findById(groupId).lean();
                const creator = await (0, userClient_1.fetchUserData)(updatedGroup.creator.toString());
                const groupWithCreator = {
                    ...updatedGroup,
                    creator: creator || updatedGroup.creator,
                };
                libs_1.logger.info('User requested to join private group', { groupId, userId });
                return groupWithCreator;
            }
            group.members.push({
                user: userId,
                role: 'member',
                joinedAt: new Date(),
            });
            group.memberCount += 1;
            await group.save();
            const updatedGroup = await Group_model_1.Group.findById(groupId).lean();
            const creator = await (0, userClient_1.fetchUserData)(updatedGroup.creator.toString());
            const groupWithCreator = {
                ...updatedGroup,
                creator: creator || updatedGroup.creator,
            };
            libs_1.logger.info('User joined group', { groupId, userId });
            return groupWithCreator;
        }
        catch (error) {
            libs_1.logger.error('Error joining group', { error, groupId });
            throw error;
        }
    }
    async cancelJoinRequest(groupId, userId) {
        try {
            const group = await Group_model_1.Group.findById(groupId);
            if (!group) {
                throw libs_1.Errors.notFound('Group not found');
            }
            group.joinRequest = group.joinRequest.filter(req => req.toString() !== userId);
            await group.save();
            const updatedGroup = await Group_model_1.Group.findById(groupId).lean();
            const creator = await (0, userClient_1.fetchUserData)(updatedGroup.creator.toString());
            const groupWithCreator = {
                ...updatedGroup,
                creator: creator || updatedGroup.creator,
            };
            libs_1.logger.info('User cancelled join request', { groupId, userId });
            return groupWithCreator;
        }
        catch (error) {
            libs_1.logger.error('Error cancelling join request', { error, groupId });
            throw error;
        }
    }
    async approveJoinRequest(groupId, adminUserId, requestUserId) {
        try {
            const group = await Group_model_1.Group.findById(groupId);
            if (!group) {
                throw libs_1.Errors.notFound('Group not found');
            }
            const requestIndex = group.joinRequest.findIndex(req => req.toString() === requestUserId);
            if (requestIndex === -1) {
                throw libs_1.Errors.notFound('Join request not found');
            }
            group.joinRequest.splice(requestIndex, 1);
            group.members.push({
                user: requestUserId,
                role: 'member',
                joinedAt: new Date(),
            });
            group.memberCount += 1;
            await group.save();
            const updatedGroup = await Group_model_1.Group.findById(groupId).lean();
            const creator = await (0, userClient_1.fetchUserData)(updatedGroup.creator.toString());
            const groupWithCreator = {
                ...updatedGroup,
                creator: creator || updatedGroup.creator,
            };
            libs_1.logger.info('Join request approved', { groupId, adminUserId, requestUserId });
            return groupWithCreator;
        }
        catch (error) {
            libs_1.logger.error('Error approving join request', { error, groupId });
            throw error;
        }
    }
    async rejectJoinRequest(groupId, adminUserId, requestUserId) {
        try {
            const group = await Group_model_1.Group.findById(groupId);
            if (!group) {
                throw libs_1.Errors.notFound('Group not found');
            }
            const member = group.members.find(m => m.user.toString() === adminUserId);
            if (!member || (member.role !== 'admin' && member.role !== 'moderator')) {
                throw libs_1.Errors.forbidden('Only admins and moderators can reject join requests');
            }
            group.joinRequest = group.joinRequest.filter(req => req.toString() !== requestUserId);
            await group.save();
            const updatedGroup = await Group_model_1.Group.findById(groupId).lean();
            const creator = await (0, userClient_1.fetchUserData)(updatedGroup.creator.toString());
            const groupWithCreator = {
                ...updatedGroup,
                creator: creator || updatedGroup.creator,
            };
            libs_1.logger.info('Join request rejected', { groupId, adminUserId, requestUserId });
            return groupWithCreator;
        }
        catch (error) {
            libs_1.logger.error('Error rejecting join request', { error, groupId });
            throw error;
        }
    }
    async leaveGroup(groupId, userId) {
        try {
            const group = await Group_model_1.Group.findById(groupId);
            if (!group) {
                throw libs_1.Errors.notFound('Group not found');
            }
            if (group.creator.toString() === userId) {
                throw libs_1.Errors.badRequest('Group creator cannot leave the group');
            }
            const memberIndex = group.members.findIndex(m => m.user.toString() === userId);
            if (memberIndex === -1) {
                throw libs_1.Errors.badRequest('Not a member of this group');
            }
            group.members.splice(memberIndex, 1);
            group.memberCount = Math.max(0, group.memberCount - 1);
            await group.save();
            libs_1.logger.info('User left group', { groupId, userId });
        }
        catch (error) {
            libs_1.logger.error('Error leaving group', { error, groupId });
            throw error;
        }
    }
    async getMyGroups(userId) {
        try {
            const groups = await Group_model_1.Group.find({ 'members.user': userId })
                .sort({ createdAt: -1 })
                .lean();
            const groupsWithUsers = await Promise.all(groups.map(async (group) => {
                const creator = await (0, userClient_1.fetchUserData)(group.creator.toString());
                return {
                    ...group,
                    creator: creator || group.creator,
                };
            }));
            libs_1.logger.info('User groups fetched', { userId, count: groupsWithUsers.length });
            return groupsWithUsers;
        }
        catch (error) {
            libs_1.logger.error('Error fetching user groups', { error, userId });
            throw error;
        }
    }
}
exports.default = new GroupService();
//# sourceMappingURL=GroupService.js.map