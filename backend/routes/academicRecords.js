// backend/routes/academicRecords.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const academicRecordController = require('../controllers/academicRecordController');

// @route   GET /api/academic-records
// @desc    Get all academic records
// @access  Private
router.get('/', auth, academicRecordController.getAcademicRecords);

// @route   GET /api/academic-records/term/:term
// @desc    Get all academic records for a term
// @access  Private
router.get('/term/:term', auth, academicRecordController.getAcademicRecordsByTerm);

// @route   POST /api/academic-records
// @desc    Add an academic record
// @access  Private
router.post('/', auth, academicRecordController.addAcademicRecord);

// @route   PUT /api/academic-records/:id
// @desc    Update an academic record
// @access  Private
router.put('/:id', auth, academicRecordController.updateAcademicRecord);

// @route   DELETE /api/academic-records/:id
// @desc    Delete an academic record
// @access  Private
router.delete('/:id', auth, academicRecordController.deleteAcademicRecord);

module.exports = router;