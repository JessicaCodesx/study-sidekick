// models/Course.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const courseSchema = new Schema({
  // Client-generated ID field to match IndexedDB IDs
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  colorTheme: {
    type: String,
    required: true
  },
  description: String,
  instructor: String,
  schedule: String,
  location: String,
  isArchived: {
    type: Boolean,
    default: false
  },
  totalWeight: Number,
  currentGrade: Number,
  // Link to user by Firebase UID
  firebaseId: {
    type: String,
    required: true,
    index: true // Add index for performance
  }
}, {
  timestamps: true
});

// Add compound index for faster queries
courseSchema.index({ firebaseId: 1, id: 1 });

export default mongoose.model('Course', courseSchema);