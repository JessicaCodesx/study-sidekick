const Flashcard = require('../models/Flashcard');
const Course = require('../models/Course');
const Unit = require('../models/Unit');

// Get all flashcards for a course
exports.getFlashcardsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    // Check if the course exists and belongs to the user
    const course = await Course.findOne({ 
      _id: courseId,
      firebaseId: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const flashcards = await Flashcard.find({ courseId });
    res.json(flashcards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all flashcards for a unit
exports.getFlashcardsByUnit = async (req, res) => {
  try {
    const unitId = req.params.unitId;
    
    // Check if the unit exists
    const unit = await Unit.findById(unitId);
    
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    
    // Check if the course belongs to the user
    const course = await Course.findOne({ 
      _id: unit.courseId,
      firebaseId: req.user.id
    });
    
    if (!course) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const flashcards = await Flashcard.find({ unitId });
    res.json(flashcards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add a new flashcard
exports.addFlashcard = async (req, res) => {
  try {
    const { courseId, unitId, question, answer, tags } = req.body;
    
    // Check if the course exists and belongs to the user
    const course = await Course.findOne({ 
      _id: courseId,
      firebaseId: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if the unit exists and belongs to the course
    const unit = await Unit.findOne({
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
};

// Update a flashcard
exports.updateFlashcard = async (req, res) => {
  try {
    const { question, answer, tags, reviewCount, confidenceLevel } = req.body;
    
    // Find flashcard and check if it exists
    let flashcard = await Flashcard.findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }
    
    // Check if the flashcard belongs to the user
    if (flashcard.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update fields
    const updatedFlashcard = await Flashcard.findByIdAndUpdate(
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
};

// Delete a flashcard
exports.deleteFlashcard = async (req, res) => {
  try {
    // Find flashcard and check if it exists
    let flashcard = await Flashcard.findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }
    
    // Check if the flashcard belongs to the user
    if (flashcard.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Flashcard.findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Flashcard removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
