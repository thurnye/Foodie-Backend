import { Router } from 'express';
import { ChannelController } from '../controllers/channel.controller';

const router = Router();
const channelController = new ChannelController();

// Channel routes
router.post('/', channelController.createChannel);
router.get('/team/:teamId', channelController.getTeamChannels);
router.get('/:channelId', channelController.getChannelById);
router.put('/:channelId', channelController.updateChannel);
router.delete('/:channelId', channelController.deleteChannel);
router.post('/:channelId/members', channelController.addMember);
router.delete('/:channelId/members/:userId', channelController.removeMember);

export default router;
