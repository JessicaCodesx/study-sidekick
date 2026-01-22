// backend/routes/users.js
import { Router } from 'express';
const router = Router();
import { getUserProfile, updateUserProfile } from '../controllers/userController';
import auth from '../middleware/auth';

// @route   GET /api/users/me
// @desc    Get user profile
// @access  Private
router.get('/me', auth, getUserProfile);

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', auth, updateUserProfile);

export default router;