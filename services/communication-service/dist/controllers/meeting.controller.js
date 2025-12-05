"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingController = void 0;
const libs_1 = require("@foodie/libs");
const meeting_service_1 = __importDefault(require("../services/meeting.service"));
class MeetingController {
    async getUserMeetings(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { status, startDate, endDate } = req.query;
            const meetings = await meeting_service_1.default.getUserMeetings(userId, {
                status: status,
                startDate: startDate,
                endDate: endDate,
            });
            res.json({ success: true, data: meetings });
        }
        catch (error) {
            libs_1.logger.error('Error fetching user meetings', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch meetings' });
        }
    }
    async getUpcomingMeetings(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const meetings = await meeting_service_1.default.getUpcomingMeetings(userId);
            res.json({ success: true, data: meetings });
        }
        catch (error) {
            libs_1.logger.error('Error fetching upcoming meetings', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch upcoming meetings' });
        }
    }
    async getMeetingById(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { meetingId } = req.params;
            const meeting = await meeting_service_1.default.getMeetingById(meetingId, userId);
            res.json({ success: true, data: meeting });
        }
        catch (error) {
            libs_1.logger.error('Error fetching meeting', {
                error: error.message,
                meetingId: req.params.meetingId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch meeting' });
        }
    }
    async createMeeting(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const meetingData = req.body;
            const meeting = await meeting_service_1.default.createMeeting(userId, meetingData);
            res.status(201).json({ success: true, data: meeting });
        }
        catch (error) {
            libs_1.logger.error('Error creating meeting', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to create meeting' });
        }
    }
    async updateMeeting(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { meetingId } = req.params;
            const updates = req.body;
            const meeting = await meeting_service_1.default.updateMeeting(meetingId, userId, updates);
            res.json({ success: true, data: meeting });
        }
        catch (error) {
            libs_1.logger.error('Error updating meeting', {
                error: error.message,
                meetingId: req.params.meetingId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to update meeting' });
        }
    }
    async deleteMeeting(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { meetingId } = req.params;
            await meeting_service_1.default.deleteMeeting(meetingId, userId);
            res.json({ success: true, data: { message: 'Meeting deleted successfully' } });
        }
        catch (error) {
            libs_1.logger.error('Error deleting meeting', {
                error: error.message,
                meetingId: req.params.meetingId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to delete meeting' });
        }
    }
    async addParticipant(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { meetingId } = req.params;
            const { userId: participantId } = req.body;
            const meeting = await meeting_service_1.default.addParticipant(meetingId, userId, participantId);
            res.json({ success: true, data: meeting });
        }
        catch (error) {
            libs_1.logger.error('Error adding participant to meeting', {
                error: error.message,
                meetingId: req.params.meetingId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to add participant' });
        }
    }
    async removeParticipant(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { meetingId, participantId } = req.params;
            const meeting = await meeting_service_1.default.removeParticipant(meetingId, userId, participantId);
            res.json({ success: true, data: meeting });
        }
        catch (error) {
            libs_1.logger.error('Error removing participant from meeting', {
                error: error.message,
                meetingId: req.params.meetingId,
            });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to remove participant' });
        }
    }
}
exports.MeetingController = MeetingController;
exports.default = new MeetingController();
//# sourceMappingURL=meeting.controller.js.map