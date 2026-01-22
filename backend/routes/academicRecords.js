// backend/routes/academicRecords.js
import { Router } from 'express';
const router = Router();
import auth from '../middleware/auth';
import { getAcademicRecords, getAcademicRecordsByTerm, addAcademicRecord, updateAcademicRecord, deleteAcademicRecord } from '../controllers/academicRecordController';

// @route   GET /api/academic-records
// @desc    Get all academic records
// @access  Private
router.get('/', auth, getAcademicRecords);

// @route   GET /api/academic-records/term/:term
// @desc    Get all academic records for a term
// @access  Private
router.get('/term/:term', auth, getAcademicRecordsByTerm);

// @route   POST /api/academic-records
// @desc    Add an academic record
// @access  Private
router.post('/', auth, addAcademicRecord);

// @route   PUT /api/academic-records/:id
// @desc    Update an academic record
// @access  Private
router.put('/:id', auth, updateAcademicRecord);

// @route   DELETE /api/academic-records/:id
// @desc    Delete an academic record
// @access  Private
router.delete('/:id', auth, deleteAcademicRecord);

export default router;