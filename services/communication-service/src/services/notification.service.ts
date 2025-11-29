import { Errors, logger } from '@foodie/libs';
import { Notification } from '../models';

class NotificationService {
  /**
   * Get all notifications for a user
   */
  async getUserNotifications(
    userId: string,
    filters?: {
      isRead?: boolean;
      type?: 'mention' | 'message' | 'meeting' | 'system';
      page?: number;
      limit?: number;
    }
  ): Promise<any> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;

      const query: any = { userId };

      if (filters?.isRead !== undefined) {
        query.isRead = filters.isRead;
      }

      if (filters?.type) {
        query.type = filters.type;
      }

      const notifications = await Notification.find(query)
        .populate('channelId', 'name')
        .populate('conversationId')
        .populate('meetingId', 'title startTime')
        .populate('messageId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error getting user notifications: ${error}`);
      throw Errors.internalServer();
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await Notification.countDocuments({ userId, isRead: false });
      return count;
    } catch (error) {
      logger.error(`Error getting unread notification count: ${error}`);
      throw Errors.internalServer();
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId: string, userId: string): Promise<any> {
    try {
      const notification = await Notification.findById(notificationId)
        .populate('channelId', 'name')
        .populate('conversationId')
        .populate('meetingId', 'title startTime')
        .populate('messageId')
        .lean();

      if (!notification) throw Errors.notFound('Notification not found');

      if (notification.userId.toString() !== userId)
        throw Errors.forbidden('You do not have access to this notification');

      return notification;
    } catch (error) {
      logger.error(`Error fetching notification: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new notification
   */
  async createNotification(data: {
    userId: string;
    type: 'mention' | 'message' | 'meeting' | 'system';
    title: string;
    message: string;
    channelId?: string;
    conversationId?: string;
    meetingId?: string;
    messageId?: string;
  }): Promise<any> {
    try {
      const notification = new Notification(data);
      await notification.save();

      const populatedNotification = await Notification.findById(notification._id)
        .populate('channelId', 'name')
        .populate('conversationId')
        .populate('meetingId', 'title startTime')
        .populate('messageId')
        .lean();

      return populatedNotification;
    } catch (error) {
      logger.error(`Error creating notification: ${error}`);
      if (error instanceof Error && error.name === 'ValidationError') {
        throw Errors.badRequest(error.message);
      }
      throw Errors.internalServer();
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<any> {
    try {
      const notification = await Notification.findById(notificationId);

      if (!notification) throw Errors.notFound('Notification not found');

      if (notification.userId.toString() !== userId)
        throw Errors.forbidden('You do not have access to this notification');

      notification.isRead = true;
      await notification.save();

      return notification;
    } catch (error) {
      logger.error(`Error marking notification as read: ${error}`);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    } catch (error) {
      logger.error(`Error marking all notifications as read: ${error}`);
      throw Errors.internalServer();
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const notification = await Notification.findById(notificationId);

      if (!notification) throw Errors.notFound('Notification not found');

      if (notification.userId.toString() !== userId)
        throw Errors.forbidden('You do not have access to this notification');

      await Notification.findByIdAndDelete(notificationId);
    } catch (error) {
      logger.error(`Error deleting notification: ${error}`);
      throw error;
    }
  }

  /**
   * Delete all read notifications for a user
   */
  async deleteAllRead(userId: string): Promise<void> {
    try {
      await Notification.deleteMany({ userId, isRead: true });
    } catch (error) {
      logger.error(`Error deleting all read notifications: ${error}`);
      throw Errors.internalServer();
    }
  }

  /**
   * Create mention notification
   */
  async createMentionNotification(
    userId: string,
    mentionedBy: string,
    messageId: string,
    channelId?: string,
    conversationId?: string
  ): Promise<any> {
    try {
      const notification = new Notification({
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
    } catch (error) {
      logger.error(`Error creating mention notification: ${error}`);
      throw error;
    }
  }

  /**
   * Create meeting notification
   */
  async createMeetingNotification(
    userId: string,
    meetingId: string,
    title: string,
    message: string
  ): Promise<any> {
    try {
      const notification = new Notification({
        userId,
        type: 'meeting',
        title,
        message,
        meetingId,
      });
      await notification.save();

      return notification;
    } catch (error) {
      logger.error(`Error creating meeting notification: ${error}`);
      throw error;
    }
  }
}

export default new NotificationService();
