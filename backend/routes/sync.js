// backend/routes/sync.js
import { Router } from 'express';
const router = Router();
import auth from '../middleware/auth';
import { syncData, getChanges } from '../controllers/syncController';

// @route   POST /api/sync
// @desc    Sync client data to server
// @access  Private
router.post('/', auth, syncData);

// @route   GET /api/sync
// @desc    Get changes since lastSync
// @access  Private
router.get('/', auth, getChanges);

export default router;