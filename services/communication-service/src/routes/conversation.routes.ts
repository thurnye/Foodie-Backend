import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';

const router = Router();
const conversationController = new ConversationController();

// Conversation routes
router.post('/', conversationController.findOrCreateDirectConversation);
router.get('/', conversationController.getUserConversations);
router.get('/:conversationId', conversationController.getConversationById);
router.delete('/:conversationId', conversationController.deleteConversation);

export default router;
