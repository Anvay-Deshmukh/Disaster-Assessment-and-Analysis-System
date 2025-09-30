import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import * as incidentController from '../controllers/incident.controller.js';

const router = express.Router();

router.use(protect);

// Create by any authenticated user
router.post('/', incidentController.createIncident);

// List incidents (admin/rescue)
router.get('/', restrictTo('admin', 'rescue'), incidentController.listIncidents);

// Admin actions
router.post('/:incidentId/assign', restrictTo('admin'), incidentController.assignTeam);
router.post('/:incidentId/cancel', restrictTo('admin'), incidentController.cancelIncident);

// Rescue action
router.post('/:incidentId/accept', restrictTo('admin', 'rescue'), incidentController.acceptIncident);

// Reporter poll (any auth)
router.get('/:id', incidentController.getIncident);

export default router;


