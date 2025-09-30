 import express from 'express';
 import { protect, restrictTo } from '../middleware/auth.middleware.js';
 import {
   createReport,
   getReports,
   getReportById,
   assignReport,
   updateReportStatus,
 } from '../controllers/report.controller.js';

 const router = express.Router();

 // Create a new report (user)
 router.post('/', protect, createReport);

 // Get reports (admin: all, user: own)
 router.get('/', protect, getReports);

 // Get report by id
 router.get('/:id', protect, getReportById);

 // Assign a report to a team (admin)
 router.post('/:id/assign', protect, restrictTo('admin'), assignReport);

 // Update report status (admin)
 router.patch('/:id/status', protect, restrictTo('admin'), updateReportStatus);

 export default router;

