// backend/routes/sync.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const syncController = require('../controllers/syncController');

// @route   POST /api/sync
// @desc    Sync client data to server
// @access  Private
router.post('/', auth, syncController.syncData);

// @route   GET /api/sync
// @desc    Get changes since lastSync
// @access  Private
router.get('/', auth, syncController.getChanges);

module.exports = router;