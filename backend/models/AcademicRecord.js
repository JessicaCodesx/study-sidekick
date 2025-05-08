const mongoose = require('mongoose');

const academicRecordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  grade: String,
  gradePercentage: Number,
  letterGrade: String,
  notes: String,
  firebaseId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AcademicRecord', academicRecordSchema);