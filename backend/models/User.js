import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  firebaseId: {
    type: String,
    required: true,
    unique: true,
    index: true
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
  },
  // Add fields to track synchronization
  lastSyncTimestamp: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default model('User', userSchema);