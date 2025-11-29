import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import { Team, Channel } from '../models';

class TeamService {
  /**
   * Get all teams for a user (teams they are a member of)
   */
  async getUserTeams(userId: string): Promise<any[]> {
    try {
      const teams = await Team.find({ members: userId })
        .populate('channels')
        .sort({ createdAt: -1 })
        .lean();

      return teams;
    } catch (error) {
      logger.error(`Error getting user teams: ${error}`);
      throw Errors.internalServer();
    }
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId: string, userId: string): Promise<any> {
    try {
      const team = await Team.findById(teamId)
        .populate('channels')
        .lean();

      if (!team) throw Errors.notFound('Team not found');

      // Check if user is a member
      const isMember = team.members.some(
        (member: any) => member.toString() === userId
      );
      if (!isMember) throw Errors.forbidden('You are not a member of this team');

      return team;
    } catch (error) {
      logger.error(`Error fetching team: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new team
   */
  async createTeam(
    userId: string,
    data: { name: string; description?: string; avatar?: string }
  ): Promise<any> {
    try {
      const team = new Team({
        ...data,
        owner: userId,
        members: [userId], // Owner is automatically a member
      });
      await team.save();

      // Create default "general" channel for the team
      const generalChannel = new Channel({
        teamId: team._id,
        name: 'general',
        description: 'General channel for team discussions',
        type: 'text',
        isPrivate: false,
        members: [userId], // Add owner to the general channel
      });
      await generalChannel.save();

      // Add the channel to the team
      team.channels.push(generalChannel._id);
      await team.save();

      const populatedTeam = await Team.findById(team._id)
        .populate('channels')
        .lean();

      return populatedTeam;
    } catch (error) {
      logger.error(`Error creating team: ${error}`);
      if (error instanceof Error && error.name === 'ValidationError') {
        throw Errors.badRequest(error.message);
      }
      throw Errors.internalServer();
    }
  }

  /**
   * Update a team
   */
  async updateTeam(
    teamId: string,
    userId: string,
    data: { name?: string; description?: string; avatar?: string }
  ): Promise<any> {
    try {
      const team = await Team.findById(teamId);

      if (!team) throw Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw Errors.forbidden('Only the team owner can update the team');

      Object.assign(team, data);
      await team.save();

      const updatedTeam = await Team.findById(teamId)
        .populate('channels')
        .lean();

      return updatedTeam;
    } catch (error) {
      logger.error(`Error updating team: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a team
   */
  async deleteTeam(teamId: string, userId: string): Promise<void> {
    try {
      const team = await Team.findById(teamId);

      if (!team) throw Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw Errors.forbidden('Only the team owner can delete the team');

      // Delete all channels associated with the team
      await Channel.deleteMany({ teamId });

      await Team.findByIdAndDelete(teamId);
    } catch (error) {
      logger.error(`Error deleting team: ${error}`);
      throw error;
    }
  }

  /**
   * Add member to team
   */
  async addMember(
    teamId: string,
    userId: string,
    memberUserId: string
  ): Promise<any> {
    try {
      const team = await Team.findById(teamId);

      if (!team) throw Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw Errors.forbidden('Only the team owner can add members');

      // Check if member already exists
      if (team.members.some((m) => m.toString() === memberUserId)) {
        throw Errors.badRequest('User is already a member of this team');
      }

      team.members.push(new Types.ObjectId(memberUserId));
      await team.save();

      const updatedTeam = await Team.findById(teamId)
        .populate('channels')
        .lean();

      return updatedTeam;
    } catch (error) {
      logger.error(`Error adding member to team: ${error}`);
      throw error;
    }
  }

  /**
   * Remove member from team
   */
  async removeMember(
    teamId: string,
    userId: string,
    memberUserId: string
  ): Promise<any> {
    try {
      const team = await Team.findById(teamId);

      if (!team) throw Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw Errors.forbidden('Only the team owner can remove members');

      // Cannot remove the owner
      if (team.owner.toString() === memberUserId) {
        throw Errors.badRequest('Cannot remove the team owner');
      }

      team.members = team.members.filter(
        (m) => m.toString() !== memberUserId
      );
      await team.save();

      const updatedTeam = await Team.findById(teamId)
        .populate('channels')
        .lean();

      return updatedTeam;
    } catch (error) {
      logger.error(`Error removing member from team: ${error}`);
      throw error;
    }
  }
}

export default new TeamService();
