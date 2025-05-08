const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  tags: [String],
  reviewCount: {
    type: Number,
    default: 0
  },
  confidenceLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  lastReviewed: Date,
  firebaseId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Flashcard', flashcardSchema);
