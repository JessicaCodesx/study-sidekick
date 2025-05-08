// backend/routes/courses.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getCourses, addCourse, updateCourse, deleteCourse } = require('../controllers/courseController');

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

module.exports = router;