import { Schema, model } from 'mongoose';

const flashcardSchema = new Schema({
  // Client-generated ID field
  id: {
    type: String,
    required: true,
    unique: true
  },
  courseId: {
    type: String,
    required: true,
    index: true
  },
  unitId: {
    type: String,
    required: true,
    index: true
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
  // Link to user by Firebase UID
  firebaseId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Add compound indices
flashcardSchema.index({ firebaseId: 1, courseId: 1 });
flashcardSchema.index({ firebaseId: 1, unitId: 1 });
flashcardSchema.index({ firebaseId: 1, id: 1 });
// Performance index for confidence-based queries
flashcardSchema.index({ firebaseId: 1, confidenceLevel: 1 });

export default model('Flashcard', flashcardSchema);