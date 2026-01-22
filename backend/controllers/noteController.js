import Note, { find, findById, findByIdAndUpdate, findByIdAndRemove } from '../models/Note';
import { findOne } from '../models/Course';
import { findById as _findById, findOne as _findOne } from '../models/Unit';

// Get all notes for a course
export async function getNotesByCourse(req, res) {
  try {
    const courseId = req.params.courseId;
    
    // Check if the course exists and belongs to the user
    const course = await findOne({ 
      _id: courseId,
      firebaseId: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const notes = await find({ courseId });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Get all notes for a unit
export async function getNotesByUnit(req, res) {
  try {
    const unitId = req.params.unitId;
    
    // Check if the unit exists and belongs to the user
    const unit = await _findById(unitId);
    
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    
    // Check if the course belongs to the user
    const course = await findOne({ 
      _id: unit.courseId,
      firebaseId: req.user.id
    });
    
    if (!course) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const notes = await find({ unitId });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Add a new note
export async function addNote(req, res) {
  try {
    const { courseId, unitId, title, content, tags } = req.body;
    
    // Check if the course exists and belongs to the user
    const course = await findOne({ 
      _id: courseId,
      firebaseId: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if the unit exists and belongs to the course
    const unit = await _findOne({
      _id: unitId,
      courseId
    });
    
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    
    const note = new Note({
      courseId,
      unitId,
      title,
      content,
      tags,
      firebaseId: req.user.id
    });
    
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Update a note
export async function updateNote(req, res) {
  try {
    const { title, content, tags } = req.body;
    
    // Find note and check if it exists
    let note = await findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Check if the note belongs to the user
    if (note.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update fields
    const updatedNote = await findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        tags
      },
      { new: true }
    );
    
    res.json(updatedNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Delete a note
export async function deleteNote(req, res) {
  try {
    // Find note and check if it exists
    let note = await findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Check if the note belongs to the user
    if (note.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Note removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}