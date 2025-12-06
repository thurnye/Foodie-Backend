'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const mongoose_1 = require('mongoose');
const libs_1 = require('@foodie/libs');
const models_1 = require('../models');
const userClient_1 = require('../utils/userClient');
class TeamService {
  async populateTeamUserData(team) {
    try {
      const ownerData = await (0, userClient_1.fetchUserData)(
        team.owner.toString()
      );
      const membersData = await Promise.all(
        team.members.map(async (memberId) => {
          const userData = await (0, userClient_1.fetchUserData)(
            memberId.toString()
          );
          return userData || { _id: memberId.toString() };
        })
      );
      return {
        ...team,
        owner: ownerData || team.owner,
        members: membersData.filter(Boolean),
      };
    } catch (error) {
      libs_1.logger.warn('Error populating team user data', { error });
      return team;
    }
  }
  async getUserTeams(userId) {
    try {
      // console.log("userId:::", userId);
      const teams = await models_1.Team.find({ members: userId })
        .populate('channels')
        .sort({ createdAt: -1 })
        .lean();
      const teamsWithUserData = await Promise.all(
        teams.map((team) => this.populateTeamUserData(team))
      );
      return teamsWithUserData;
    } catch (error) {
      libs_1.logger.error(`Error getting user teams: ${error}`);
      throw libs_1.Errors.internalServer();
    }
  }
  async getTeamById(teamId, userId) {
    try {
      const team = await models_1.Team.findById(teamId)
        .populate('channels')
        .lean();
      if (!team) throw libs_1.Errors.notFound('Team not found');
      const isMember = team.members.some(
        (member) => member.toString() === userId
      );
      if (!isMember)
        throw libs_1.Errors.forbidden('You are not a member of this team');
      const teamWithUserData = await this.populateTeamUserData(team);
      return teamWithUserData;
    } catch (error) {
      libs_1.logger.error(`Error fetching team: ${error}`);
      throw error;
    }
  }
  async createTeam(userId, data) {
    try {
      const team = new models_1.Team({
        ...data,
        owner: userId,
        members: [userId],
      });
      await team.save();
      const generalChannel = new models_1.Channel({
        teamId: team._id,
        name: 'general',
        description: 'General channel for team discussions',
        type: 'text',
        isPrivate: false,
        members: [userId],
      });
      await generalChannel.save();
      team.channels.push(generalChannel._id);
      await team.save();
      const populatedTeam = await models_1.Team.findById(team._id)
        .populate('channels')
        .lean();
      const teamWithUserData = await this.populateTeamUserData(populatedTeam);
      return teamWithUserData;
    } catch (error) {
      libs_1.logger.error(`Error creating team: ${error}`);
      if (error instanceof Error && error.name === 'ValidationError') {
        throw libs_1.Errors.badRequest(error.message);
      }
      throw libs_1.Errors.internalServer();
    }
  }
  async updateTeam(teamId, userId, data) {
    try {
      const team = await models_1.Team.findById(teamId);
      if (!team) throw libs_1.Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw libs_1.Errors.forbidden(
          'Only the team owner can update the team'
        );
      Object.assign(team, data);
      await team.save();
      const updatedTeam = await models_1.Team.findById(teamId)
        .populate('channels')
        .lean();
      const teamWithUserData = await this.populateTeamUserData(updatedTeam);
      return teamWithUserData;
    } catch (error) {
      libs_1.logger.error(`Error updating team: ${error}`);
      throw error;
    }
  }
  async deleteTeam(teamId, userId) {
    try {
      const team = await models_1.Team.findById(teamId);
      if (!team) throw libs_1.Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw libs_1.Errors.forbidden(
          'Only the team owner can delete the team'
        );
      await models_1.Channel.deleteMany({ teamId });
      await models_1.Team.findByIdAndDelete(teamId);
    } catch (error) {
      libs_1.logger.error(`Error deleting team: ${error}`);
      throw error;
    }
  }
  async addMember(teamId, userId, memberUserId) {
    try {
      const team = await models_1.Team.findById(teamId);
      if (!team) throw libs_1.Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw libs_1.Errors.forbidden('Only the team owner can add members');
      if (team.members.some((m) => m.toString() === memberUserId)) {
        throw libs_1.Errors.badRequest('User is already a member of this team');
      }
      team.members.push(new mongoose_1.Types.ObjectId(memberUserId));
      await team.save();
      await models_1.Channel.updateMany(
        { teamId, isPrivate: false },
        { $addToSet: { members: new mongoose_1.Types.ObjectId(memberUserId) } }
      );
      const updatedTeam = await models_1.Team.findById(teamId)
        .populate('channels')
        .lean();
      const teamWithUserData = await this.populateTeamUserData(updatedTeam);
      return teamWithUserData;
    } catch (error) {
      libs_1.logger.error(`Error adding member to team: ${error}`);
      throw error;
    }
  }
  async removeMember(teamId, userId, memberUserId) {
    try {
      const team = await models_1.Team.findById(teamId);
      if (!team) throw libs_1.Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw libs_1.Errors.forbidden('Only the team owner can remove members');
      if (team.owner.toString() === memberUserId) {
        throw libs_1.Errors.badRequest('Cannot remove the team owner');
      }
      team.members = team.members.filter((m) => m.toString() !== memberUserId);
      await team.save();
      await models_1.Channel.updateMany(
        { teamId },
        { $pull: { members: memberUserId } }
      );
      const updatedTeam = await models_1.Team.findById(teamId)
        .populate('channels')
        .lean();
      const teamWithUserData = await this.populateTeamUserData(updatedTeam);
      return teamWithUserData;
    } catch (error) {
      libs_1.logger.error(`Error removing member from team: ${error}`);
      throw error;
    }
  }
  async inviteMemberByEmail(teamId, userId, email) {
    try {
      const team = await models_1.Team.findById(teamId);
      if (!team) throw libs_1.Errors.notFound('Team not found');
      if (team.owner.toString() !== userId)
        throw libs_1.Errors.forbidden('Only the team owner can invite members');
      const user = await (0, userClient_1.fetchUserByEmail)(email);
      // console.log('USER:::', user);
      if (!user) {
        throw libs_1.Errors.notFound(`User with email ${email} not found`);
      }
      const memberUserId = user._id;
      if (team.members.some((m) => m.toString() === memberUserId)) {
        throw libs_1.Errors.badRequest('User is already a member of this team');
      }
      team.members.push(memberUserId);
      await team.save();
      await models_1.Channel.updateMany(
        { teamId, isPrivate: false },
        { $addToSet: { members: memberUserId } }
      );
      const updatedTeam = await models_1.Team.findById(teamId)
        .populate('channels')
        .lean();
      const teamWithUserData = await this.populateTeamUserData(updatedTeam);
      return teamWithUserData;
    } catch (error) {
      libs_1.logger.error(`Error inviting member to team: ${error}`);
      throw error;
    }
  }
}
exports.default = new TeamService();
//# sourceMappingURL=team.service.js.map
