"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_routes_1 = __importDefault(require("./team.routes"));
const channel_routes_1 = __importDefault(require("./channel.routes"));
const message_routes_1 = __importDefault(require("./message.routes"));
const conversation_routes_1 = __importDefault(require("./conversation.routes"));
const meeting_routes_1 = __importDefault(require("./meeting.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const router = (0, express_1.Router)();
router.use('/teams', team_routes_1.default);
router.use('/channels', channel_routes_1.default);
router.use('/messages', message_routes_1.default);
router.use('/conversations', conversation_routes_1.default);
router.use('/meetings', meeting_routes_1.default);
router.use('/notifications', notification_routes_1.default);
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Communication service is running' });
});
exports.default = router;
//# sourceMappingURL=index.js.map