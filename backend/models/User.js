const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system', 'pink'],
    default: 'system'
  },
  studyStreak: {
    type: Number,
    default: 0
  },
  lastStudyDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);