import { Schema, model } from 'mongoose';

const academicRecordSchema = new Schema({
  // Client-generated ID field
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true,
    index: true
  },
  credits: {
    type: Number,
    required: true
  },
  grade: String,
  gradePercentage: Number,
  letterGrade: String,
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
academicRecordSchema.index({ firebaseId: 1, term: 1 });
academicRecordSchema.index({ firebaseId: 1, id: 1 });

export default model('AcademicRecord', academicRecordSchema);