import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';

const router = Router();
const messageController = new MessageController();

// Message routes
router.post('/', messageController.createMessage);
router.get('/channel/:channelId', messageController.getChannelMessages);
router.get('/conversation/:conversationId', messageController.getConversationMessages);
router.put('/:messageId', messageController.updateMessage);
router.delete('/:messageId', messageController.deleteMessage);
router.post('/:messageId/reactions', messageController.addReaction);
router.delete('/:messageId/reactions/:emoji', messageController.addReaction);

export default router;
