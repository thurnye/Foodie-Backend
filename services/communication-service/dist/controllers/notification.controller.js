"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const libs_1 = require("@foodie/libs");
const notification_service_1 = __importDefault(require("../services/notification.service"));
class NotificationController {
    async getUserNotifications(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { isRead, type, page, limit } = req.query;
            const notifications = await notification_service_1.default.getUserNotifications(userId, {
                isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
                type: type,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({ success: true, data: notifications });
        }
        catch (error) {
            libs_1.logger.error('Error fetching user notifications', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
        }
    }
    async getUnreadCount(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const count = await notification_service_1.default.getUnreadCount(userId);
            res.json({ success: true, data: { count } });
        }
        catch (error) {
            libs_1.logger.error('Error fetching unread notification count', {
                error: error.message,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
        }
    }
    async getNotificationById(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { notificationId } = req.params;
            const notification = await notification_service_1.default.getNotificationById(notificationId, userId);
            res.json({ success: true, data: notification });
        }
        catch (error) {
            libs_1.logger.error('Error fetching notification', {
                error: error.message,
                notificationId: req.params.notificationId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch notification' });
        }
    }
    async createNotification(req, res) {
        try {
            const notificationData = req.body;
            const notification = await notification_service_1.default.createNotification(notificationData);
            res.status(201).json({ success: true, data: notification });
        }
        catch (error) {
            libs_1.logger.error('Error creating notification', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to create notification' });
        }
    }
    async markAsRead(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { notificationId } = req.params;
            const notification = await notification_service_1.default.markAsRead(notificationId, userId);
            res.json({ success: true, data: notification });
        }
        catch (error) {
            libs_1.logger.error('Error marking notification as read', {
                error: error.message,
                notificationId: req.params.notificationId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to mark as read' });
        }
    }
    async markAllAsRead(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            await notification_service_1.default.markAllAsRead(userId);
            res.json({ success: true, data: { message: 'All notifications marked as read' } });
        }
        catch (error) {
            libs_1.logger.error('Error marking all notifications as read', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to mark all as read' });
        }
    }
    async deleteNotification(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { notificationId } = req.params;
            await notification_service_1.default.deleteNotification(notificationId, userId);
            res.json({ success: true, data: { message: 'Notification deleted successfully' } });
        }
        catch (error) {
            libs_1.logger.error('Error deleting notification', {
                error: error.message,
                notificationId: req.params.notificationId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to delete notification' });
        }
    }
    async deleteAllRead(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            await notification_service_1.default.deleteAllRead(userId);
            res.json({
                success: true,
                data: { message: 'All read notifications deleted successfully' },
            });
        }
        catch (error) {
            libs_1.logger.error('Error deleting all read notifications', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to delete all read' });
        }
    }
}
exports.NotificationController = NotificationController;
exports.default = new NotificationController();
//# sourceMappingURL=notification.controller.js.map