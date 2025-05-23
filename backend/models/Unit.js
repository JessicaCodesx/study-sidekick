import { Schema, model } from 'mongoose';

const unitSchema = new Schema({
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
  name: {
    type: String,
    required: true
  },
  orderIndex: {
    type: Number,
    required: true
  },
  description: String,
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
unitSchema.index({ firebaseId: 1, courseId: 1 });
unitSchema.index({ firebaseId: 1, id: 1 });

export default model('Unit', unitSchema);