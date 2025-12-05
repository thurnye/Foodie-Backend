import { Router } from 'express';
import teamRoutes from './team.routes';
import channelRoutes from './channel.routes';
import messageRoutes from './message.routes';
import conversationRoutes from './conversation.routes';
import meetingRoutes from './meeting.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Mount all routes
router.use('/teams', teamRoutes);
router.use('/channels', channelRoutes);
router.use('/messages', messageRoutes);
router.use('/conversations', conversationRoutes);
router.use('/meetings', meetingRoutes);
router.use('/notifications', notificationRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Communication service is running' });
});

export default router;
