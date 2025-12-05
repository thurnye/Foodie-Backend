"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const router = (0, express_1.Router)();
const messageController = new message_controller_1.MessageController();
router.post('/', messageController.createMessage.bind(messageController));
router.get('/channel/:channelId', messageController.getChannelMessages.bind(messageController));
router.get('/conversation/:conversationId', messageController.getConversationMessages.bind(messageController));
router.put('/:messageId', messageController.updateMessage.bind(messageController));
router.delete('/:messageId', messageController.deleteMessage.bind(messageController));
router.post('/:messageId/reactions', messageController.addReaction.bind(messageController));
router.delete('/:messageId/reactions/:emoji', messageController.addReaction.bind(messageController));
exports.default = router;
//# sourceMappingURL=message.routes.js.map