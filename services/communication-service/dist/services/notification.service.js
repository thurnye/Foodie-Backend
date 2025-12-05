"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const libs_1 = require("@foodie/libs");
const models_1 = require("../models");
class NotificationService {
    async getUserNotifications(userId, filters) {
        try {
            const page = filters?.page || 1;
            const limit = filters?.limit || 50;
            const query = { userId };
            if (filters?.isRead !== undefined) {
                query.isRead = filters.isRead;
            }
            if (filters?.type) {
                query.type = filters.type;
            }
            const notifications = await models_1.Notification.find(query)
                .populate('channelId', 'name')
                .populate('conversationId')
                .populate('meetingId', 'title startTime')
                .populate('messageId')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
            const total = await models_1.Notification.countDocuments(query);
            return {
                notifications,
                total,
                page,
                pages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            libs_1.logger.error(`Error getting user notifications: ${error}`);
            throw libs_1.Errors.internalServer();
        }
    }
    async getUnreadCount(userId) {
        try {
            const count = await models_1.Notification.countDocuments({ userId, isRead: false });
            return count;
        }
        catch (error) {
            libs_1.logger.error(`Error getting unread notification count: ${error}`);
            throw libs_1.Errors.internalServer();
        }
    }
    async getNotificationById(notificationId, userId) {
        try {
            const notification = await models_1.Notification.findById(notificationId)
                .populate('channelId', 'name')
                .populate('conversationId')
                .populate('meetingId', 'title startTime')
                .populate('messageId')
                .lean();
            if (!notification)
                throw libs_1.Errors.notFound('Notification not found');
            if (notification.userId.toString() !== userId)
                throw libs_1.Errors.forbidden('You do not have access to this notification');
            return notification;
        }
        catch (error) {
            libs_1.logger.error(`Error fetching notification: ${error}`);
            throw error;
        }
    }
    async createNotification(data) {
        try {
            const notification = new models_1.Notification(data);
            await notification.save();
            const populatedNotification = await models_1.Notification.findById(notification._id)
                .populate('channelId', 'name')
                .populate('conversationId')
                .populate('meetingId', 'title startTime')
                .populate('messageId')
                .lean();
            return populatedNotification;
        }
        catch (error) {
            libs_1.logger.error(`Error creating notification: ${error}`);
            if (error instanceof Error && error.name === 'ValidationError') {
                throw libs_1.Errors.badRequest(error.message);
            }
            throw libs_1.Errors.internalServer();
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            const notification = await models_1.Notification.findById(notificationId);
            if (!notification)
                throw libs_1.Errors.notFound('Notification not found');
            if (notification.userId.toString() !== userId)
                throw libs_1.Errors.forbidden('You do not have access to this notification');
            notification.isRead = true;
            await notification.save();
            return notification;
        }
        catch (error) {
            libs_1.logger.error(`Error marking notification as read: ${error}`);
            throw error;
        }
    }
    async markAllAsRead(userId) {
        try {
            await models_1.Notification.updateMany({ userId, isRead: false }, { isRead: true });
        }
        catch (error) {
            libs_1.logger.error(`Error marking all notifications as read: ${error}`);
            throw libs_1.Errors.internalServer();
        }
    }
    async deleteNotification(notificationId, userId) {
        try {
            const notification = await models_1.Notification.findById(notificationId);
            if (!notification)
                throw libs_1.Errors.notFound('Notification not found');
            if (notification.userId.toString() !== userId)
                throw libs_1.Errors.forbidden('You do not have access to this notification');
            await models_1.Notification.findByIdAndDelete(notificationId);
        }
        catch (error) {
            libs_1.logger.error(`Error deleting notification: ${error}`);
            throw error;
        }
    }
    async deleteAllRead(userId) {
        try {
            await models_1.Notification.deleteMany({ userId, isRead: true });
        }
        catch (error) {
            libs_1.logger.error(`Error deleting all read notifications: ${error}`);
            throw libs_1.Errors.internalServer();
        }
    }
    async createMentionNotification(userId, mentionedBy, messageId, channelId, conversationId) {
        try {
            const notification = new models_1.Notification({
                userId,
                type: 'mention',
                title: 'You were mentioned',
                message: `${mentionedBy} mentioned you in a message`,
                messageId,
                channelId,
                conversationId,
            });
            await notification.save();
            return notification;
        }
        catch (error) {
            libs_1.logger.error(`Error creating mention notification: ${error}`);
            throw error;
        }
    }
    async createMeetingNotification(userId, meetingId, title, message) {
        try {
            const notification = new models_1.Notification({
                userId,
                type: 'meeting',
                title,
                message,
                meetingId,
            });
            await notification.save();
            return notification;
        }
        catch (error) {
            libs_1.logger.error(`Error creating meeting notification: ${error}`);
            throw error;
        }
    }
}
exports.default = new NotificationService();
//# sourceMappingURL=notification.service.js.map