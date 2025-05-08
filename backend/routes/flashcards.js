const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const flashcardController = require('../controllers/flashcardController');

// @route   GET /api/flashcards/course/:courseId
// @desc    Get all flashcards for a course
// @access  Private
router.get('/course/:courseId', auth, flashcardController.getFlashcardsByCourse);

// @route   GET /api/flashcards/unit/:unitId
// @desc    Get all flashcards for a unit
// @access  Private
router.get('/unit/:unitId', auth, flashcardController.getFlashcardsByUnit);

// @route   POST /api/flashcards
// @desc    Add a flashcard
// @access  Private
router.post('/', auth, flashcardController.addFlashcard);

// @route   PUT /api/flashcards/:id
// @desc    Update a flashcard
// @access  Private
router.put('/:id', auth, flashcardController.updateFlashcard);

// @route   DELETE /api/flashcards/:id
// @desc    Delete a flashcard
// @access  Private
router.delete('/:id', auth, flashcardController.deleteFlashcard);

module.exports = router;