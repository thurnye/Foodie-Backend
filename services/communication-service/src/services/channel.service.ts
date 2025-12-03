import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import { Channel, Team, Message } from '../models';

class ChannelService {
  /**
   * Get all channels for a team
   */
  async getTeamChannels(teamId: string, userId: string): Promise<any[]> {
    try {
      // Verify user is a member of the team
      const team = await Team.findById(teamId);
      if (!team) throw Errors.notFound('Team not found');

      const isMember = team.members.some((m) => m.toString() === userId);
      if (!isMember) throw Errors.forbidden('You are not a member of this team');

      const channels = await Channel.find({ teamId })
        .populate('lastMessage')
        .sort({ createdAt: 1 })
        .lean();

      // Filter private channels - only show if user is a member
      const filteredChannels = channels.filter((channel) => {
        if (!channel.isPrivate) return true;
        return channel.members.some((m: any) => m.toString() === userId);
      });

      return filteredChannels;
    } catch (error) {
      logger.error(`Error getting team channels: ${error}`);
      throw error;
    }
  }

  /**
   * Get channel by ID
   */
  async getChannelById(channelId: string, userId: string): Promise<any> {
    try {
      const channel = await Channel.findById(channelId)
        .populate('teamId')
        .populate('lastMessage')
        .lean();

      if (!channel) throw Errors.notFound('Channel not found');

      // Check if user is a member of the team
      const team = await Team.findById(channel.teamId);
      if (!team) throw Errors.notFound('Team not found');

      const isTeamMember = team.members.some((m) => m.toString() === userId);
      if (!isTeamMember) throw Errors.forbidden('You are not a member of this team');

      // Check if channel is private and user is a member
      if (channel.isPrivate) {
        const isChannelMember = channel.members.some(
          (m: any) => m._id.toString() === userId
        );
        if (!isChannelMember)
          throw Errors.forbidden('You do not have access to this private channel');
      }

      return channel;
    } catch (error) {
      logger.error(`Error fetching channel: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new channel
   */
  async createChannel(
    userId: string,
    data: {
      teamId: string;
      name: string;
      description?: string;
      type?: 'text' | 'announcement';
      isPrivate?: boolean;
    }
  ): Promise<any> {
    try {
      // Verify user is owner of the team
      const team = await Team.findById(data.teamId);
      if (!team) throw Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw Errors.forbidden('Only the team owner can create channels');

      const channel = new Channel({
        ...data,
        members: data.isPrivate ? [userId] : team.members,
      });
      await channel.save();

      // Add channel to team
      team.channels.push(channel._id);
      await team.save();

      const populatedChannel = await Channel.findById(channel._id)
        .populate('teamId')
        .lean();

      return populatedChannel;
    } catch (error) {
      logger.error(`Error creating channel: ${error}`);
      if (error instanceof Error && error.name === 'ValidationError') {
        throw Errors.badRequest(error.message);
      }
      throw error;
    }
  }

  /**
   * Update a channel
   */
  async updateChannel(
    channelId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      type?: 'text' | 'announcement';
      isPrivate?: boolean;
    }
  ): Promise<any> {
    try {
      const channel = await Channel.findById(channelId);
      if (!channel) throw Errors.notFound('Channel not found');

      // Verify user is owner of the team
      const team = await Team.findById(channel.teamId);
      if (!team) throw Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw Errors.forbidden('Only the team owner can update channels');

      Object.assign(channel, data);
      await channel.save();

      const updatedChannel = await Channel.findById(channelId)
        .populate('teamId')
        .populate('lastMessage')
        .lean();

      return updatedChannel;
    } catch (error) {
      logger.error(`Error updating channel: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a channel
   */
  async deleteChannel(channelId: string, userId: string): Promise<void> {
    try {
      const channel = await Channel.findById(channelId);
      if (!channel) throw Errors.notFound('Channel not found');

      // Verify user is owner of the team
      const team = await Team.findById(channel.teamId);
      if (!team) throw Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw Errors.forbidden('Only the team owner can delete channels');

      // Remove channel from team
      team.channels = team.channels.filter((c) => c.toString() !== channelId);
      await team.save();

      // Delete all messages in the channel
      await Message.deleteMany({ channelId });

      await Channel.findByIdAndDelete(channelId);
    } catch (error) {
      logger.error(`Error deleting channel: ${error}`);
      throw error;
    }
  }

  /**
   * Add member to private channel
   */
  async addMember(
    channelId: string,
    userId: string,
    memberUserId: string
  ): Promise<any> {
    try {
      const channel = await Channel.findById(channelId);
      if (!channel) throw Errors.notFound('Channel not found');

      // Verify user is owner of the team
      const team = await Team.findById(channel.teamId);
      if (!team) throw Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw Errors.forbidden('Only the team owner can add members to channels');

      // Verify member is part of the team
      const isTeamMember = team.members.some((m) => m.toString() === memberUserId);
      if (!isTeamMember) throw Errors.badRequest('User is not a member of the team');

      // Check if member already exists
      if (channel.members.some((m) => m.toString() === memberUserId)) {
        throw Errors.badRequest('User is already a member of this channel');
      }

      channel.members.push(new Types.ObjectId(memberUserId));
      await channel.save();

      const updatedChannel = await Channel.findById(channelId)
        .populate('teamId')
        .lean();

      return updatedChannel;
    } catch (error) {
      logger.error(`Error adding member to channel: ${error}`);
      throw error;
    }
  }

  /**
   * Remove member from private channel
   */
  async removeMember(
    channelId: string,
    userId: string,
    memberUserId: string
  ): Promise<any> {
    try {
      const channel = await Channel.findById(channelId);
      if (!channel) throw Errors.notFound('Channel not found');

      // Verify user is owner of the team
      const team = await Team.findById(channel.teamId);
      if (!team) throw Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw Errors.forbidden('Only the team owner can remove members from channels');

      channel.members = channel.members.filter((m) => m.toString() !== memberUserId);
      await channel.save();

      const updatedChannel = await Channel.findById(channelId)
        .populate('teamId')
        .lean();

      return updatedChannel;
    } catch (error) {
      logger.error(`Error removing member from channel: ${error}`);
      throw error;
    }
  }
}

export default new ChannelService();
