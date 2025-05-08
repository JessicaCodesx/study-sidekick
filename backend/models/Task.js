const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  dueDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['assignment', 'exam', 'quiz', 'project', 'reading', 'other'],
    default: 'assignment'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: Number,
    min: 1,
    max: 3,
    default: 2
  },
  weight: Number,
  grade: Number,
  firebaseId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);