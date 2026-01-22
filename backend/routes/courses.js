import express from 'express';
import auth from '../middleware/auth.js';
import { getCourses, addCourse, updateCourse, deleteCourse } from '../controllers/courseController.js';

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', auth, getCourses);

// @route   POST /api/courses
// @desc    Add a course
// @access  Private
router.post('/', auth, addCourse);

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private
router.put('/:id', auth, updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private
router.delete('/:id', auth, deleteCourse);

export default router;