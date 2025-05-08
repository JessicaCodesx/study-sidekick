// backend/models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
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
  // Link to user by Firebase UID instead of MongoDB ObjectId
  firebaseId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);