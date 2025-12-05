"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const conversation_controller_1 = require("../controllers/conversation.controller");
const router = (0, express_1.Router)();
const conversationController = new conversation_controller_1.ConversationController();
router.post('/', conversationController.findOrCreateDirectConversation);
router.get('/', conversationController.getUserConversations);
router.get('/:conversationId', conversationController.getConversationById);
router.delete('/:conversationId', conversationController.deleteConversation);
exports.default = router;
//# sourceMappingURL=conversation.routes.js.map