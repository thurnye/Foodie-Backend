import { Router } from 'express';
import { ChannelController } from '../controllers/channel.controller';

const router = Router();
const channelController = new ChannelController();

// Channel routes
router.post('/', channelController.createChannel.bind(channelController));
router.get('/team/:teamId', channelController.getTeamChannels.bind(channelController));
router.get('/:channelId', channelController.getChannelById.bind(channelController));
router.put('/:channelId', channelController.updateChannel.bind(channelController));
router.delete('/:channelId', channelController.deleteChannel.bind(channelController));
router.post('/:channelId/members', channelController.addMember.bind(channelController));
router.delete('/:channelId/members/:userId', channelController.removeMember.bind(channelController));

export default router;
