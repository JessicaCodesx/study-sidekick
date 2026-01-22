import { Router } from 'express';
const router = Router();
import auth from '../middleware/auth';
import { getFlashcardsByCourse, getFlashcardsByUnit, addFlashcard, updateFlashcard, deleteFlashcard } from '../controllers/flashcardController';

// @route   GET /api/flashcards/course/:courseId
// @desc    Get all flashcards for a course
// @access  Private
router.get('/course/:courseId', auth, getFlashcardsByCourse);

// @route   GET /api/flashcards/unit/:unitId
// @desc    Get all flashcards for a unit
// @access  Private
router.get('/unit/:unitId', auth, getFlashcardsByUnit);

// @route   POST /api/flashcards
// @desc    Add a flashcard
// @access  Private
router.post('/', auth, addFlashcard);

// @route   PUT /api/flashcards/:id
// @desc    Update a flashcard
// @access  Private
router.put('/:id', auth, updateFlashcard);

// @route   DELETE /api/flashcards/:id
// @desc    Delete a flashcard
// @access  Private
router.delete('/:id', auth, deleteFlashcard);

export default router;