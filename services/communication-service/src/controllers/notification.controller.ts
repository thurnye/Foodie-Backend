import { Request, Response } from 'express';
import { logger, Errors } from '@foodie/libs';
import NotificationService from '../services/notification.service';

export class NotificationController {
  /**
   * Get all notifications for the current user
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { isRead, type, page, limit } = req.query;

      const notifications = await NotificationService.getUserNotifications(userId, {
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        type: type as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({ success: true, data: notifications });
    } catch (error: any) {
      logger.error('Error fetching user notifications', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const count = await NotificationService.getUnreadCount(userId);

      res.json({ success: true, data: { count } });
    } catch (error: any) {
      logger.error('Error fetching unread notification count', {
        error: error.message,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { notificationId } = req.params;

      const notification = await NotificationService.getNotificationById(
        notificationId,
        userId
      );

      res.json({ success: true, data: notification });
    } catch (error: any) {
      logger.error('Error fetching notification', {
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

  /**
   * Create a new notification
   */
  async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const notificationData = req.body;

      const notification = await NotificationService.createNotification(
        notificationData
      );

      res.status(201).json({ success: true, data: notification });
    } catch (error: any) {
      logger.error('Error creating notification', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to create notification' });
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { notificationId } = req.params;

      const notification = await NotificationService.markAsRead(notificationId, userId);

      res.json({ success: true, data: notification });
    } catch (error: any) {
      logger.error('Error marking notification as read', {
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

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      await NotificationService.markAllAsRead(userId);

      res.json({ success: true, data: { message: 'All notifications marked as read' } });
    } catch (error: any) {
      logger.error('Error marking all notifications as read', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to mark all as read' });
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { notificationId } = req.params;

      await NotificationService.deleteNotification(notificationId, userId);

      res.json({ success: true, data: { message: 'Notification deleted successfully' } });
    } catch (error: any) {
      logger.error('Error deleting notification', {
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

  /**
   * Delete all read notifications
   */
  async deleteAllRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      await NotificationService.deleteAllRead(userId);

      res.json({
        success: true,
        data: { message: 'All read notifications deleted successfully' },
      });
    } catch (error: any) {
      logger.error('Error deleting all read notifications', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to delete all read' });
    }
  }
}

export default new NotificationController();
