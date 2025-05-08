// backend/controllers/syncController.js
const Course = require('../models/Course');
const Unit = require('../models/Unit');
const Note = require('../models/Note');
const Task = require('../models/Task');
const Flashcard = require('../models/Flashcard');
const AcademicRecord = require('../models/AcademicRecord');
const User = require('../models/User');

// Helper function to convert client IDs to MongoDB _id format if needed
const processClientId = (clientId) => {
  // If you're using MongoDB ObjectId as _id, and the clientId doesn't match 
  // MongoDB's ObjectId format, you may need to handle that conversion here.
  // For simplicity, we'll assume clientId can be used directly
  return clientId;
};

// Handle data sync from client to server
exports.syncData = async (req, res) => {
  try {
    const { courses, tasks, flashcards, notes, units, academicRecords, userSettings } = req.body;
    const userId = req.user.id;
    
    let syncResults = {
      courses: 0,
      units: 0,
      notes: 0, 
      flashcards: 0,
      tasks: 0,
      academicRecords: 0,
      user: false
    };
    
    // Process courses
    if (courses && Array.isArray(courses)) {
      for (const course of courses) {
        await Course.findOneAndUpdate(
          { id: course.id, firebaseId: userId },
          { 
            ...course, 
            firebaseId: userId,
            // Set the timestamps manually if they're not already provided
            updatedAt: course.updatedAt || Date.now()
          },
          { upsert: true, new: true }
        );
        syncResults.courses++;
      }
    }
    
    // Process units
    if (units && Array.isArray(units)) {
      for (const unit of units) {
        await Unit.findOneAndUpdate(
          { id: unit.id, firebaseId: userId },
          { 
            ...unit, 
            firebaseId: userId,
            updatedAt: unit.updatedAt || Date.now()
          },
          { upsert: true, new: true }
        );
        syncResults.units++;
      }
    }
    
    // Process notes
    if (notes && Array.isArray(notes)) {
      for (const note of notes) {
        await Note.findOneAndUpdate(
          { id: note.id, firebaseId: userId },
          { 
            ...note, 
            firebaseId: userId,
            updatedAt: note.updatedAt || Date.now()
          },
          { upsert: true, new: true }
        );
        syncResults.notes++;
      }
    }
    
    // Process flashcards
    if (flashcards && Array.isArray(flashcards)) {
      for (const flashcard of flashcards) {
        await Flashcard.findOneAndUpdate(
          { id: flashcard.id, firebaseId: userId },
          { 
            ...flashcard, 
            firebaseId: userId,
            updatedAt: flashcard.updatedAt || Date.now()
          },
          { upsert: true, new: true }
        );
        syncResults.flashcards++;
      }
    }
    
    // Process tasks
    if (tasks && Array.isArray(tasks)) {
      for (const task of tasks) {
        await Task.findOneAndUpdate(
          { id: task.id, firebaseId: userId },
          { 
            ...task, 
            firebaseId: userId,
            updatedAt: task.updatedAt || Date.now()
          },
          { upsert: true, new: true }
        );
        syncResults.tasks++;
      }
    }
    
    // Process academic records
    if (academicRecords && Array.isArray(academicRecords)) {
      for (const record of academicRecords) {
        await AcademicRecord.findOneAndUpdate(
          { id: record.id, firebaseId: userId },
          { 
            ...record, 
            firebaseId: userId,
            updatedAt: record.updatedAt || Date.now()
          },
          { upsert: true, new: true }
        );
        syncResults.academicRecords++;
      }
    }
    
    // Process user settings
    if (userSettings) {
      await User.findOneAndUpdate(
        { firebaseId: userId },
        { 
          ...userSettings, 
          firebaseId: userId 
        },
        { upsert: true, new: true }
      );
      syncResults.user = true;
    }
    
    res.json({ 
      success: true, 
      timestamp: Date.now(),
      syncResults
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get changes since lastSync
exports.getChanges = async (req, res) => {
  try {
    const userId = req.user.id;
    const lastSync = req.query.lastSync ? new Date(parseInt(req.query.lastSync)) : new Date(0);
    
    // Fetch changes for each entity type
    const courseChanges = await Course.find({
      firebaseId: userId,
      updatedAt: { $gt: lastSync }
    });
    
    const unitChanges = await Unit.find({
      firebaseId: userId,
      updatedAt: { $gt: lastSync }
    });
    
    const noteChanges = await Note.find({
      firebaseId: userId,
      updatedAt: { $gt: lastSync }
    });
    
    const flashcardChanges = await Flashcard.find({
      firebaseId: userId,
      updatedAt: { $gt: lastSync }
    });
    
    const taskChanges = await Task.find({
      firebaseId: userId,
      updatedAt: { $gt: lastSync }
    });
    
    const academicRecordChanges = await AcademicRecord.find({
      firebaseId: userId,
      updatedAt: { $gt: lastSync }
    });
    
    // Get user settings
    const userSettings = await User.findOne({ firebaseId: userId });
    
    const changeResults = {
      courses: courseChanges.length,
      units: unitChanges.length,
      notes: noteChanges.length,
      flashcards: flashcardChanges.length,
      tasks: taskChanges.length,
      academicRecords: academicRecordChanges.length,
      user: userSettings ? true : false
    };
    
    res.json({
      courses: courseChanges,
      units: unitChanges,
      notes: noteChanges,
      flashcards: flashcardChanges,
      tasks: taskChanges,
      academicRecords: academicRecordChanges,
      userSettings: userSettings,
      timestamp: Date.now(),
      changeResults
    });
  } catch (error) {
    console.error('Error fetching changes:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};