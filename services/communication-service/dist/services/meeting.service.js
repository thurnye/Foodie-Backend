"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const libs_1 = require("@foodie/libs");
const models_1 = require("../models");
class MeetingService {
    async getUserMeetings(userId, filters) {
        try {
            const query = {
                $or: [{ organizer: userId }, { participants: userId }],
            };
            if (filters?.status) {
                query.status = filters.status;
            }
            if (filters?.startDate || filters?.endDate) {
                query.startTime = {};
                if (filters.startDate) {
                    query.startTime.$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    query.startTime.$lte = new Date(filters.endDate);
                }
            }
            const meetings = await models_1.Meeting.find(query)
                .populate('organizer', 'name email avatar')
                .populate('participants', 'name email avatar')
                .populate('teamId', 'name')
                .populate('channelId', 'name')
                .sort({ startTime: 1 })
                .lean();
            return meetings;
        }
        catch (error) {
            libs_1.logger.error(`Error getting user meetings: ${error}`);
            throw libs_1.Errors.internalServer();
        }
    }
    async getMeetingById(meetingId, userId) {
        try {
            const meeting = await models_1.Meeting.findById(meetingId)
                .populate('organizer', 'name email avatar')
                .populate('participants', 'name email avatar')
                .populate('teamId', 'name')
                .populate('channelId', 'name')
                .lean();
            if (!meeting)
                throw libs_1.Errors.notFound('Meeting not found');
            const isOrganizerOrParticipant = meeting.organizer._id.toString() === userId ||
                meeting.participants.some((p) => p._id.toString() === userId);
            if (!isOrganizerOrParticipant)
                throw libs_1.Errors.forbidden('You do not have access to this meeting');
            return meeting;
        }
        catch (error) {
            libs_1.logger.error(`Error fetching meeting: ${error}`);
            throw error;
        }
    }
    async createMeeting(userId, data) {
        try {
            if (data.teamId) {
                const team = await models_1.Team.findById(data.teamId);
                if (!team)
                    throw libs_1.Errors.notFound('Team not found');
                const isTeamMember = team.members.some((m) => m.toString() === userId);
                if (!isTeamMember)
                    throw libs_1.Errors.forbidden('You are not a member of this team');
            }
            if (data.channelId) {
                const channel = await models_1.Channel.findById(data.channelId).populate('teamId');
                if (!channel)
                    throw libs_1.Errors.notFound('Channel not found');
                const team = channel.teamId;
                const isTeamMember = team.members.some((m) => m.toString() === userId);
                if (!isTeamMember)
                    throw libs_1.Errors.forbidden('You are not a member of this team');
            }
            const meeting = new models_1.Meeting({
                ...data,
                organizer: userId,
                participants: data.participants.map((id) => new mongoose_1.Types.ObjectId(id)),
                status: 'scheduled',
            });
            await meeting.save();
            const populatedMeeting = await models_1.Meeting.findById(meeting._id)
                .populate('organizer', 'name email avatar')
                .populate('participants', 'name email avatar')
                .populate('teamId', 'name')
                .populate('channelId', 'name')
                .lean();
            return populatedMeeting;
        }
        catch (error) {
            libs_1.logger.error(`Error creating meeting: ${error}`);
            if (error instanceof Error && error.name === 'ValidationError') {
                throw libs_1.Errors.badRequest(error.message);
            }
            throw error;
        }
    }
    async updateMeeting(meetingId, userId, data) {
        try {
            const meeting = await models_1.Meeting.findById(meetingId);
            if (!meeting)
                throw libs_1.Errors.notFound('Meeting not found');
            if (meeting.organizer.toString() !== userId)
                throw libs_1.Errors.forbidden('Only the organizer can update the meeting');
            if (data.participants) {
                data.participants = data.participants.map((id) => new mongoose_1.Types.ObjectId(id));
            }
            Object.assign(meeting, data);
            await meeting.save();
            const updatedMeeting = await models_1.Meeting.findById(meetingId)
                .populate('organizer', 'name email avatar')
                .populate('participants', 'name email avatar')
                .populate('teamId', 'name')
                .populate('channelId', 'name')
                .lean();
            return updatedMeeting;
        }
        catch (error) {
            libs_1.logger.error(`Error updating meeting: ${error}`);
            throw error;
        }
    }
    async deleteMeeting(meetingId, userId) {
        try {
            const meeting = await models_1.Meeting.findById(meetingId);
            if (!meeting)
                throw libs_1.Errors.notFound('Meeting not found');
            if (meeting.organizer.toString() !== userId)
                throw libs_1.Errors.forbidden('Only the organizer can delete the meeting');
            await models_1.Meeting.findByIdAndDelete(meetingId);
        }
        catch (error) {
            libs_1.logger.error(`Error deleting meeting: ${error}`);
            throw error;
        }
    }
    async addParticipant(meetingId, userId, participantId) {
        try {
            const meeting = await models_1.Meeting.findById(meetingId);
            if (!meeting)
                throw libs_1.Errors.notFound('Meeting not found');
            if (meeting.organizer.toString() !== userId)
                throw libs_1.Errors.forbidden('Only the organizer can add participants');
            if (meeting.participants.some((p) => p.toString() === participantId)) {
                throw libs_1.Errors.badRequest('User is already a participant in this meeting');
            }
            meeting.participants.push(new mongoose_1.Types.ObjectId(participantId));
            await meeting.save();
            const updatedMeeting = await models_1.Meeting.findById(meetingId)
                .populate('organizer', 'name email avatar')
                .populate('participants', 'name email avatar')
                .populate('teamId', 'name')
                .populate('channelId', 'name')
                .lean();
            return updatedMeeting;
        }
        catch (error) {
            libs_1.logger.error(`Error adding participant to meeting: ${error}`);
            throw error;
        }
    }
    async removeParticipant(meetingId, userId, participantId) {
        try {
            const meeting = await models_1.Meeting.findById(meetingId);
            if (!meeting)
                throw libs_1.Errors.notFound('Meeting not found');
            const isOrganizer = meeting.organizer.toString() === userId;
            const isSelfRemoval = participantId === userId;
            if (!isOrganizer && !isSelfRemoval) {
                throw libs_1.Errors.forbidden('You can only remove yourself or must be the organizer to remove others');
            }
            meeting.participants = meeting.participants.filter((p) => p.toString() !== participantId);
            await meeting.save();
            const updatedMeeting = await models_1.Meeting.findById(meetingId)
                .populate('organizer', 'name email avatar')
                .populate('participants', 'name email avatar')
                .populate('teamId', 'name')
                .populate('channelId', 'name')
                .lean();
            return updatedMeeting;
        }
        catch (error) {
            libs_1.logger.error(`Error removing participant from meeting: ${error}`);
            throw error;
        }
    }
    async getUpcomingMeetings(userId) {
        try {
            const now = new Date();
            const meetings = await models_1.Meeting.find({
                $or: [{ organizer: userId }, { participants: userId }],
                startTime: { $gte: now },
                status: { $in: ['scheduled', 'ongoing'] },
            })
                .populate('organizer', 'name email avatar')
                .populate('participants', 'name email avatar')
                .populate('teamId', 'name')
                .populate('channelId', 'name')
                .sort({ startTime: 1 })
                .limit(10)
                .lean();
            return meetings;
        }
        catch (error) {
            libs_1.logger.error(`Error getting upcoming meetings: ${error}`);
            throw libs_1.Errors.internalServer();
        }
    }
}
exports.default = new MeetingService();
//# sourceMappingURL=meeting.service.js.map