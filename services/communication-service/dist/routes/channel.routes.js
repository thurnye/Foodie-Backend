"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const channel_controller_1 = require("../controllers/channel.controller");
const router = (0, express_1.Router)();
const channelController = new channel_controller_1.ChannelController();
router.post('/', channelController.createChannel.bind(channelController));
router.get('/team/:teamId', channelController.getTeamChannels.bind(channelController));
router.get('/:channelId', channelController.getChannelById.bind(channelController));
router.put('/:channelId', channelController.updateChannel.bind(channelController));
router.delete('/:channelId', channelController.deleteChannel.bind(channelController));
router.post('/:channelId/members', channelController.addMember.bind(channelController));
router.delete('/:channelId/members/:userId', channelController.removeMember.bind(channelController));
exports.default = router;
//# sourceMappingURL=channel.routes.js.map