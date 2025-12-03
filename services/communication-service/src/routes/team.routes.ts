import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';

const router = Router();
const teamController = new TeamController();

// Team routes
router.post('/', teamController.createTeam.bind(teamController));
router.get('/', teamController.getUserTeams.bind(teamController));
router.get('/:teamId', teamController.getTeamById.bind(teamController));
router.put('/:teamId', teamController.updateTeam.bind(teamController));
router.delete('/:teamId', teamController.deleteTeam.bind(teamController));
router.post('/:teamId/members', teamController.addMember.bind(teamController));
router.post('/:teamId/invite', teamController.inviteMemberByEmail.bind(teamController));
router.delete('/:teamId/members/:userId', teamController.removeMember.bind(teamController));

export default router;
