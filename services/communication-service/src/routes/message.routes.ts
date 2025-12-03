import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';

const router = Router();
const messageController = new MessageController();

// Message routes
router.post('/', messageController.createMessage.bind(messageController));
router.get('/channel/:channelId', messageController.getChannelMessages.bind(messageController));
router.get('/conversation/:conversationId', messageController.getConversationMessages.bind(messageController));
router.put('/:messageId', messageController.updateMessage.bind(messageController));
router.delete('/:messageId', messageController.deleteMessage.bind(messageController));
router.post('/:messageId/reactions', messageController.addReaction.bind(messageController));
router.delete('/:messageId/reactions/:emoji', messageController.addReaction.bind(messageController));

export default router;
