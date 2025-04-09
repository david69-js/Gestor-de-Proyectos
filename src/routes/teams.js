const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teams.controller');
const { checkRole, checkTeamMembership } = require('../middleware/auth');

// Get all teams
router.get('/', teamsController.getAllTeams);

// Get team by ID
router.get('/:id', teamsController.getTeamById);

// Create new team
router.post('/', teamsController.createTeam);

// Update team
router.put('/:id', teamsController.updateTeam);

// Delete team
router.delete('/:id', teamsController.deleteTeam);

// Get team members
router.get('/:id/members', checkTeamMembership, teamsController.getTeamMembers);

// Add team member
router.post('/:id/members', checkRole(['Administrador', 'Líder de Equipo']), checkTeamMembership, teamsController.addTeamMember);

// Remove team member
router.delete('/:id/members/:userId', checkRole(['Administrador', 'Líder de Equipo']), checkTeamMembership, teamsController.removeTeamMember);

module.exports = router;