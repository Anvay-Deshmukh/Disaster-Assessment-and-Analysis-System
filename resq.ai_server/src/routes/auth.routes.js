import express from 'express';
import { signup, login, logout, getMe } from '../controllers/auth.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

// Protected routes (require authentication)
router.use(protect);

// Get current user
router.get('/me', getMe, (req, res) => {
  const { role } = req.user;
  let redirectPath = '/';
  
  if (role === 'admin') {
    redirectPath = '/admin-dashboard';
  } else if (role === 'rescue') {
    redirectPath = '/rescue-dashboard';
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
      redirectTo: redirectPath
    }
  });
});

// Role-based routes
const adminRouter = express.Router();
const rescueRouter = express.Router();

// Admin routes
router.use('/admin', restrictTo('admin'), adminRouter);
// Add admin routes here

// Rescue team routes
router.use('/rescue', restrictTo('rescue'), rescueRouter);
// Add rescue team routes here

export default router;
