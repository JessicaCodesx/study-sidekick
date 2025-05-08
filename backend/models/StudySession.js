import { Schema, model } from 'mongoose';

const studySessionSchema = new Schema({
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
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Number,
    required: true,
    index: true
  },
  notes: String,
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
studySessionSchema.index({ firebaseId: 1, courseId: 1 });
studySessionSchema.index({ firebaseId: 1, date: 1 });
studySessionSchema.index({ firebaseId: 1, id: 1 });

export default model('StudySession', studySessionSchema);