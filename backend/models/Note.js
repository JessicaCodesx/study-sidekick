import { Schema, model } from 'mongoose';

const noteSchema = new Schema({
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
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [String],
  // Link to user by Firebase UID
  firebaseId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Add compound indices for faster queries
noteSchema.index({ firebaseId: 1, courseId: 1 });
noteSchema.index({ firebaseId: 1, unitId: 1 });
noteSchema.index({ firebaseId: 1, id: 1 });

export default model('Note', noteSchema);