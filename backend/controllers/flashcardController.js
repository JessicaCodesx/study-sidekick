import Flashcard, { find, findById, findByIdAndUpdate, findByIdAndRemove } from '../models/Flashcard';
import { findOne } from '../models/Course';
import { findById as _findById, findOne as _findOne } from '../models/Unit';

// Get all flashcards for a course
export async function getFlashcardsByCourse(req, res) {
  try {
    const courseId = req.params.courseId;
    
    // Check if the course exists and belongs to the user
    const course = await findOne({ 
      _id: courseId,
      firebaseId: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const flashcards = await find({ courseId });
    res.json(flashcards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Get all flashcards for a unit
export async function getFlashcardsByUnit(req, res) {
  try {
    const unitId = req.params.unitId;
    
    // Check if the unit exists
    const unit = await _findById(unitId);
    
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    
    // Check if the course belongs to the user
    const course = await findOne({ 
      _id: unit.courseId,
      firebaseId: req.user.id
    });
    
    if (!course) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const flashcards = await find({ unitId });
    res.json(flashcards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Add a new flashcard
export async function addFlashcard(req, res) {
  try {
    const { courseId, unitId, question, answer, tags } = req.body;
    
    // Check if the course exists and belongs to the user
    const course = await findOne({ 
      _id: courseId,
      firebaseId: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if the unit exists and belongs to the course
    const unit = await _findOne({
      _id: unitId,
      courseId
    });
    
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    
    const flashcard = new Flashcard({
      courseId,
      unitId,
      question,
      answer,
      tags,
      firebaseId: req.user.id
    });
    
    const savedFlashcard = await flashcard.save();
    res.status(201).json(savedFlashcard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Update a flashcard
export async function updateFlashcard(req, res) {
  try {
    const { question, answer, tags, reviewCount, confidenceLevel } = req.body;
    
    // Find flashcard and check if it exists
    let flashcard = await findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }
    
    // Check if the flashcard belongs to the user
    if (flashcard.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update fields
    const updatedFlashcard = await findByIdAndUpdate(
      req.params.id,
      {
        question,
        answer,
        tags,
        reviewCount,
        confidenceLevel,
        lastReviewed: reviewCount !== undefined ? Date.now() : flashcard.lastReviewed
      },
      { new: true }
    );
    
    res.json(updatedFlashcard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Delete a flashcard
export async function deleteFlashcard(req, res) {
  try {
    // Find flashcard and check if it exists
    let flashcard = await findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }
    
    // Check if the flashcard belongs to the user
    if (flashcard.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Flashcard removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}
