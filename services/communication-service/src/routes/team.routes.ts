import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';

const router = Router();
const teamController = new TeamController();

// Team routes
router.post('/', teamController.createTeam);
router.get('/', teamController.getUserTeams);
router.get('/:teamId', teamController.getTeamById);
router.put('/:teamId', teamController.updateTeam);
router.delete('/:teamId', teamController.deleteTeam);
router.post('/:teamId/members', teamController.addMember);
router.delete('/:teamId/members/:userId', teamController.removeMember);

export default router;
