import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();
const notificationController = new NotificationController();

// Notification routes
router.get('/', notificationController.getUserNotifications);
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;
