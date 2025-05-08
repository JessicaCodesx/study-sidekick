const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getUnitsByCourse, 
  addUnit, 
  updateUnit, 
  deleteUnit 
} = require('../controllers/unitController');

// @route   GET /api/units/course/:courseId
// @desc    Get all units for a course
// @access  Private
router.get('/course/:courseId', auth, getUnitsByCourse);

// @route   POST /api/units
// @desc    Add a unit
// @access  Private
router.post('/', auth, addUnit);

// @route   PUT /api/units/:id
// @desc    Update a unit
// @access  Private
router.put('/:id', auth, updateUnit);

// @route   DELETE /api/units/:id
// @desc    Delete a unit
// @access  Private
router.delete('/:id', auth, deleteUnit);

module.exports = router;
