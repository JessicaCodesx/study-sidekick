// backend/models/Unit.js
const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Unit', unitSchema);