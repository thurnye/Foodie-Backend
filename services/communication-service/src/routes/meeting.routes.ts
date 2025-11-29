import { Router } from 'express';
import { MeetingController } from '../controllers/meeting.controller';

const router = Router();
const meetingController = new MeetingController();

// Meeting routes
router.post('/', meetingController.createMeeting);
router.get('/', meetingController.getUserMeetings);
router.get('/:meetingId', meetingController.getMeetingById);
router.put('/:meetingId', meetingController.updateMeeting);
router.delete('/:meetingId', meetingController.deleteMeeting);

export default router;
