import express from 'express';
import * as teamController from '../controllers/team.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Routes for team management
router
  .route('/')
  .get(teamController.getAllTeams)
  .post(restrictTo('admin', 'rescue'), teamController.createTeam);

// Routes for getting teams by specialization or nearby location
router.get('/specialization/:specialization', teamController.getTeamsBySpecialization);
router.get('/nearby', teamController.getTeamsNearLocation);
// Available teams for current user
router.get('/available', teamController.getAvailableTeams);

// Routes that require team ID
router
  .route('/:id')
  .get(teamController.getTeam)
  .patch(
    restrictTo('admin', 'rescue'),
    teamController.updateTeam
  )
  .delete(
    restrictTo('admin'),
    teamController.deleteTeam
  );

// Self-service join/leave actions
router.post('/:id/join', teamController.joinTeam);
router.delete('/:id/leave', teamController.leaveTeam);

// Team member management routes
router.post(
  '/:id/members',
  restrictTo('admin', 'rescue'),
  teamController.addTeamMember
);

router.delete(
  '/:id/members/:userId',
  restrictTo('admin', 'rescue'),
  teamController.removeTeamMember
);

router.patch(
  '/:id/leader',
  restrictTo('admin', 'rescue'),
  teamController.changeTeamLeader
);

export default router;
