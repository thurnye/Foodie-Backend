import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import { Meeting, Team, Channel } from '../models';

class MeetingService {
  /**
   * Get all meetings for a user (as organizer or participant)
   */
  async getUserMeetings(
    userId: string,
    filters?: {
      status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
      startDate?: string;
      endDate?: string;
    }
  ): Promise<any[]> {
    try {
      const query: any = {
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

      const meetings = await Meeting.find(query)
        .populate('organizer', 'name email avatar')
        .populate('participants', 'name email avatar')
        .populate('teamId', 'name')
        .populate('channelId', 'name')
        .sort({ startTime: 1 })
        .lean();

      return meetings;
    } catch (error) {
      logger.error(`Error getting user meetings: ${error}`);
      throw Errors.internalServer();
    }
  }

  /**
   * Get meeting by ID
   */
  async getMeetingById(meetingId: string, userId: string): Promise<any> {
    try {
      const meeting = await Meeting.findById(meetingId)
        .populate('organizer', 'name email avatar')
        .populate('participants', 'name email avatar')
        .populate('teamId', 'name')
        .populate('channelId', 'name')
        .lean();

      if (!meeting) throw Errors.notFound('Meeting not found');

      // Check if user is organizer or participant
      const isOrganizerOrParticipant =
        meeting.organizer._id.toString() === userId ||
        meeting.participants.some((p: any) => p._id.toString() === userId);

      if (!isOrganizerOrParticipant)
        throw Errors.forbidden('You do not have access to this meeting');

      return meeting;
    } catch (error) {
      logger.error(`Error fetching meeting: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new meeting
   */
  async createMeeting(
    userId: string,
    data: {
      title: string;
      description?: string;
      participants: string[];
      teamId?: string;
      channelId?: string;
      startTime: Date;
      endTime: Date;
      duration: number;
      isRecurring?: boolean;
      recurrencePattern?: 'daily' | 'weekly' | 'monthly';
      link?: string;
    }
  ): Promise<any> {
    try {
      // Verify team and channel if provided
      if (data.teamId) {
        const team = await Team.findById(data.teamId);
        if (!team) throw Errors.notFound('Team not found');

        const isTeamMember = team.members.some((m) => m.toString() === userId);
        if (!isTeamMember) throw Errors.forbidden('You are not a member of this team');
      }

      if (data.channelId) {
        const channel = await Channel.findById(data.channelId).populate('teamId');
        if (!channel) throw Errors.notFound('Channel not found');

        const team = channel.teamId as any;
        const isTeamMember = team.members.some((m: any) => m.toString() === userId);
        if (!isTeamMember) throw Errors.forbidden('You are not a member of this team');
      }

      const meeting = new Meeting({
        ...data,
        organizer: userId,
        participants: data.participants.map((id) => new Types.ObjectId(id)),
        status: 'scheduled',
      });
      await meeting.save();

      const populatedMeeting = await Meeting.findById(meeting._id)
        .populate('organizer', 'name email avatar')
        .populate('participants', 'name email avatar')
        .populate('teamId', 'name')
        .populate('channelId', 'name')
        .lean();

      return populatedMeeting;
    } catch (error) {
      logger.error(`Error creating meeting: ${error}`);
      if (error instanceof Error && error.name === 'ValidationError') {
        throw Errors.badRequest(error.message);
      }
      throw error;
    }
  }

  /**
   * Update a meeting
   */
  async updateMeeting(
    meetingId: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      participants?: string[];
      startTime?: Date;
      endTime?: Date;
      duration?: number;
      isRecurring?: boolean;
      recurrencePattern?: 'daily' | 'weekly' | 'monthly';
      status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
      link?: string;
    }
  ): Promise<any> {
    try {
      const meeting = await Meeting.findById(meetingId);

      if (!meeting) throw Errors.notFound('Meeting not found');
      if (meeting.organizer.toString() !== userId)
        throw Errors.forbidden('Only the organizer can update the meeting');

      // If participants are being updated, convert to ObjectIds
      if (data.participants) {
        data.participants = data.participants.map((id) => new Types.ObjectId(id)) as any;
      }

      Object.assign(meeting, data);
      await meeting.save();

      const updatedMeeting = await Meeting.findById(meetingId)
        .populate('organizer', 'name email avatar')
        .populate('participants', 'name email avatar')
        .populate('teamId', 'name')
        .populate('channelId', 'name')
        .lean();

      return updatedMeeting;
    } catch (error) {
      logger.error(`Error updating meeting: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a meeting
   */
  async deleteMeeting(meetingId: string, userId: string): Promise<void> {
    try {
      const meeting = await Meeting.findById(meetingId);

      if (!meeting) throw Errors.notFound('Meeting not found');
      if (meeting.organizer.toString() !== userId)
        throw Errors.forbidden('Only the organizer can delete the meeting');

      await Meeting.findByIdAndDelete(meetingId);
    } catch (error) {
      logger.error(`Error deleting meeting: ${error}`);
      throw error;
    }
  }

  /**
   * Add participant to meeting
   */
  async addParticipant(
    meetingId: string,
    userId: string,
    participantId: string
  ): Promise<any> {
    try {
      const meeting = await Meeting.findById(meetingId);

      if (!meeting) throw Errors.notFound('Meeting not found');
      if (meeting.organizer.toString() !== userId)
        throw Errors.forbidden('Only the organizer can add participants');

      // Check if participant already exists
      if (meeting.participants.some((p) => p.toString() === participantId)) {
        throw Errors.badRequest('User is already a participant in this meeting');
      }

      meeting.participants.push(new Types.ObjectId(participantId));
      await meeting.save();

      const updatedMeeting = await Meeting.findById(meetingId)
        .populate('organizer', 'name email avatar')
        .populate('participants', 'name email avatar')
        .populate('teamId', 'name')
        .populate('channelId', 'name')
        .lean();

      return updatedMeeting;
    } catch (error) {
      logger.error(`Error adding participant to meeting: ${error}`);
      throw error;
    }
  }

  /**
   * Remove participant from meeting
   */
  async removeParticipant(
    meetingId: string,
    userId: string,
    participantId: string
  ): Promise<any> {
    try {
      const meeting = await Meeting.findById(meetingId);

      if (!meeting) throw Errors.notFound('Meeting not found');

      // Organizer can remove anyone, participants can remove themselves
      const isOrganizer = meeting.organizer.toString() === userId;
      const isSelfRemoval = participantId === userId;

      if (!isOrganizer && !isSelfRemoval) {
        throw Errors.forbidden(
          'You can only remove yourself or must be the organizer to remove others'
        );
      }

      meeting.participants = meeting.participants.filter(
        (p) => p.toString() !== participantId
      );
      await meeting.save();

      const updatedMeeting = await Meeting.findById(meetingId)
        .populate('organizer', 'name email avatar')
        .populate('participants', 'name email avatar')
        .populate('teamId', 'name')
        .populate('channelId', 'name')
        .lean();

      return updatedMeeting;
    } catch (error) {
      logger.error(`Error removing participant from meeting: ${error}`);
      throw error;
    }
  }

  /**
   * Get upcoming meetings for a user
   */
  async getUpcomingMeetings(userId: string): Promise<any[]> {
    try {
      const now = new Date();
      const meetings = await Meeting.find({
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
    } catch (error) {
      logger.error(`Error getting upcoming meetings: ${error}`);
      throw Errors.internalServer();
    }
  }
}

export default new MeetingService();
