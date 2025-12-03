import { Request, Response } from 'express';
import { logger, Errors } from '@foodie/libs';
import TeamService from '../services/team.service';

export class TeamController {
  /**
   * Get all teams for the current user
   */
  async getUserTeams(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const teams = await TeamService.getUserTeams(userId);

      res.json({ success: true, data: teams });
    } catch (error: any) {
      logger.error('Error fetching user teams', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch teams' });
    }
  }

  /**
   * Get team by ID
   */
  async getTeamById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { teamId } = req.params;

      const team = await TeamService.getTeamById(teamId, userId);

      res.json({ success: true, data: team });
    } catch (error: any) {
      logger.error('Error fetching team', {
        error: error.message,
        teamId: req.params.teamId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch team' });
    }
  }

  /**
   * Create a new team
   */
  async createTeam(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const teamData = req.body;

      const team = await TeamService.createTeam(userId, teamData);

      res.status(201).json({ success: true, data: team });
    } catch (error: any) {
      logger.error('Error creating team', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to create team' });
    }
  }

  /**
   * Update a team
   */
  async updateTeam(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { teamId } = req.params;
      const updates = req.body;

      const team = await TeamService.updateTeam(teamId, userId, updates);

      res.json({ success: true, data: team });
    } catch (error: any) {
      logger.error('Error updating team', {
        error: error.message,
        teamId: req.params.teamId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to update team' });
    }
  }

  /**
   * Delete a team
   */
  async deleteTeam(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { teamId } = req.params;

      await TeamService.deleteTeam(teamId, userId);

      res.json({ success: true, data: { message: 'Team deleted successfully' } });
    } catch (error: any) {
      logger.error('Error deleting team', {
        error: error.message,
        teamId: req.params.teamId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to delete team' });
    }
  }

  /**
   * Add member to team
   */
  async addMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { teamId } = req.params;
      const { userId: memberUserId } = req.body;

      const team = await TeamService.addMember(teamId, userId, memberUserId);

      res.json({ success: true, data: team });
    } catch (error: any) {
      logger.error('Error adding member to team', {
        error: error.message,
        teamId: req.params.teamId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to add member to team' });
    }
  }

  /**
   * Remove member from team
   */
  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { teamId, memberId } = req.params;

      const team = await TeamService.removeMember(teamId, userId, memberId);

      res.json({ success: true, data: team });
    } catch (error: any) {
      logger.error('Error removing member from team', {
        error: error.message,
        teamId: req.params.teamId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to remove member from team' });
    }
  }

  /**
   * Invite member to team by email
   */
  async inviteMemberByEmail(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { teamId } = req.params;
      const { email } = req.body;

      if (!email) {
        throw Errors.badRequest('Email is required');
      }

      const team = await TeamService.inviteMemberByEmail(teamId, userId, email);

      res.json({ success: true, data: team });
    } catch (error: any) {
      logger.error('Error inviting member to team', {
        error: error.message,
        teamId: req.params.teamId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to invite member to team' });
    }
  }
}

export default new TeamController();
