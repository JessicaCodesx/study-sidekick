// backend/routes/tasks.js
import { Router } from 'express';
const router = Router();
import auth from '../middleware/auth';
import { getTasks, getTasksByCourse, addTask, updateTask, deleteTask } from '../controllers/taskController';

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', auth, getTasks);

// @route   GET /api/tasks/course/:courseId
// @desc    Get all tasks for a course
// @access  Private
router.get('/course/:courseId', auth, getTasksByCourse);

// @route   POST /api/tasks
// @desc    Add a task
// @access  Private
router.post('/', auth, addTask);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, deleteTask);

export default router;