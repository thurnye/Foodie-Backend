"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_controller_1 = require("../controllers/team.controller");
const router = (0, express_1.Router)();
const teamController = new team_controller_1.TeamController();
router.post('/', teamController.createTeam.bind(teamController));
router.get('/', teamController.getUserTeams.bind(teamController));
router.get('/:teamId', teamController.getTeamById.bind(teamController));
router.put('/:teamId', teamController.updateTeam.bind(teamController));
router.delete('/:teamId', teamController.deleteTeam.bind(teamController));
router.post('/:teamId/members', teamController.addMember.bind(teamController));
router.post('/:teamId/invite', teamController.inviteMemberByEmail.bind(teamController));
router.delete('/:teamId/members/:userId', teamController.removeMember.bind(teamController));
exports.default = router;
//# sourceMappingURL=team.routes.js.map