// backend/routes/tasks.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', auth, taskController.getTasks);

// @route   GET /api/tasks/course/:courseId
// @desc    Get all tasks for a course
// @access  Private
router.get('/course/:courseId', auth, taskController.getTasksByCourse);

// @route   POST /api/tasks
// @desc    Add a task
// @access  Private
router.post('/', auth, taskController.addTask);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, taskController.updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;