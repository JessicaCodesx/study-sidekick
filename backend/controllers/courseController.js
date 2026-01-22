// controllers/courseController.js
import Course from '../models/Course.js';
import { v4 as uuidv4 } from 'uuid';

// Get all courses for a user
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ firebaseId: req.user.id });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add a new course
export const addCourse = async (req, res) => {
  try {
    const { id, name, colorTheme, description, instructor, schedule, location } = req.body;
    
    const course = new Course({
      id: id || uuidv4(), // Generate ID if not provided by client
      name,
      colorTheme,
      description,
      instructor,
      schedule,
      location,
      firebaseId: req.user.id
    });
    
    const savedCourse = await course.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a course
export const updateCourse = async (req, res) => {
  try {
    const { name, colorTheme, description, instructor, schedule, location, isArchived } = req.body;
    
    // Check if course exists and belongs to user
    let course = await Course.findOne({ id: req.params.id });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Make sure user owns the course
    if (course.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update fields
    const updatedCourse = await Course.findOneAndUpdate(
      { id: req.params.id },
      {
        name,
        colorTheme,
        description,
        instructor,
        schedule,
        location,
        isArchived
      },
      { new: true }
    );
    
    res.json(updatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    // Check if course exists and belongs to user
    let course = await Course.findOne({ id: req.params.id });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Make sure user owns the course
    if (course.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Course.findOneAndDelete({ id: req.params.id });
    
    res.json({ message: 'Course removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};