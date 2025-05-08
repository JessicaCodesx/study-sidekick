import { Schema, model } from 'mongoose';

const taskSchema = new Schema({
  // Client-generated ID field
  id: {
    type: String,
    required: true,
    unique: true
  },
  courseId: {
    type: String,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['assignment', 'exam', 'quiz', 'project', 'reading', 'other'],
    default: 'assignment'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue'],
    default: 'pending',
    index: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 3,
    default: 2
  },
  weight: Number,
  grade: Number,
  completedAt: Date,
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
taskSchema.index({ firebaseId: 1, courseId: 1 });
taskSchema.index({ firebaseId: 1, dueDate: 1 });
taskSchema.index({ firebaseId: 1, status: 1 });
taskSchema.index({ firebaseId: 1, id: 1 });

export default model('Task', taskSchema);