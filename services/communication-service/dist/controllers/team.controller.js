"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const libs_1 = require("@foodie/libs");
const team_service_1 = __importDefault(require("../services/team.service"));
class TeamController {
    async getUserTeams(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const teams = await team_service_1.default.getUserTeams(userId);
            res.json({ success: true, data: teams });
        }
        catch (error) {
            libs_1.logger.error('Error fetching user teams', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to fetch teams' });
        }
    }
    async getTeamById(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { teamId } = req.params;
            const team = await team_service_1.default.getTeamById(teamId, userId);
            res.json({ success: true, data: team });
        }
        catch (error) {
            libs_1.logger.error('Error fetching team', {
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
    async createTeam(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const teamData = req.body;
            const team = await team_service_1.default.createTeam(userId, teamData);
            res.status(201).json({ success: true, data: team });
        }
        catch (error) {
            libs_1.logger.error('Error creating team', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to create team' });
        }
    }
    async updateTeam(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { teamId } = req.params;
            const updates = req.body;
            const team = await team_service_1.default.updateTeam(teamId, userId, updates);
            res.json({ success: true, data: team });
        }
        catch (error) {
            libs_1.logger.error('Error updating team', {
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
    async deleteTeam(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { teamId } = req.params;
            await team_service_1.default.deleteTeam(teamId, userId);
            res.json({ success: true, data: { message: 'Team deleted successfully' } });
        }
        catch (error) {
            libs_1.logger.error('Error deleting team', {
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
    async addMember(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { teamId } = req.params;
            const { userId: memberUserId } = req.body;
            const team = await team_service_1.default.addMember(teamId, userId, memberUserId);
            res.json({ success: true, data: team });
        }
        catch (error) {
            libs_1.logger.error('Error adding member to team', {
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
    async removeMember(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { teamId, memberId } = req.params;
            const team = await team_service_1.default.removeMember(teamId, userId, memberId);
            res.json({ success: true, data: team });
        }
        catch (error) {
            libs_1.logger.error('Error removing member from team', {
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
    async inviteMemberByEmail(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { teamId } = req.params;
            const { email } = req.body;
            if (!email) {
                throw libs_1.Errors.badRequest('Email is required');
            }
            const team = await team_service_1.default.inviteMemberByEmail(teamId, userId, email);
            res.json({ success: true, data: team });
        }
        catch (error) {
            libs_1.logger.error('Error inviting member to team', {
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
exports.TeamController = TeamController;
exports.default = new TeamController();
//# sourceMappingURL=team.controller.js.map