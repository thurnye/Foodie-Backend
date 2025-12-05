"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meeting_controller_1 = require("../controllers/meeting.controller");
const router = (0, express_1.Router)();
const meetingController = new meeting_controller_1.MeetingController();
router.post('/', meetingController.createMeeting);
router.get('/', meetingController.getUserMeetings);
router.get('/:meetingId', meetingController.getMeetingById);
router.put('/:meetingId', meetingController.updateMeeting);
router.delete('/:meetingId', meetingController.deleteMeeting);
exports.default = router;
//# sourceMappingURL=meeting.routes.js.map