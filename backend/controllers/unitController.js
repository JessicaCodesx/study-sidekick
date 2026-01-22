import Unit, { find, findById, findByIdAndUpdate, findByIdAndRemove } from '../models/Unit';
import { findOne } from '../models/Course';

// Get all units for a course
export async function getUnitsByCourse(req, res) {
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
    
    const units = await find({ courseId });
    res.json(units);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Add a new unit
export async function addUnit(req, res) {
  try {
    const { courseId, name, orderIndex, description } = req.body;
    
    // Check if the course exists and belongs to the user
    const course = await findOne({ 
      _id: courseId,
      firebaseId: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const unit = new Unit({
      courseId,
      name,
      orderIndex,
      description,
      firebaseId: req.user.id
    });
    
    const savedUnit = await unit.save();
    res.status(201).json(savedUnit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Update a unit
export async function updateUnit(req, res) {
  try {
    const { name, orderIndex, description } = req.body;
    
    // Find unit and check if it exists
    let unit = await findById(req.params.id);
    
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
    
    // Update fields
    const updatedUnit = await findByIdAndUpdate(
      req.params.id,
      {
        name,
        orderIndex,
        description
      },
      { new: true }
    );
    
    res.json(updatedUnit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Delete a unit
export async function deleteUnit(req, res) {
  try {
    // Find unit and check if it exists
    let unit = await findById(req.params.id);
    
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
    
    await findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Unit removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}