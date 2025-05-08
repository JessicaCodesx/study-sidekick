// backend/controllers/courseController.js
const Course = require('../models/Course');

// Get all courses for a user
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user.id });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add a new course
exports.addCourse = async (req, res) => {
  try {
    const { name, colorTheme, description, instructor, schedule, location } = req.body;
    
    const course = new Course({
      name,
      colorTheme,
      description,
      instructor,
      schedule,
      location,
      user: req.user.id
    });
    
    const savedCourse = await course.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    const { name, colorTheme, description, instructor, schedule, location, isArchived } = req.body;
    
    // Check if course exists and belongs to user
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Make sure user owns the course
    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update fields
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
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
exports.deleteCourse = async (req, res) => {
  try {
    // Check if course exists and belongs to user
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Make sure user owns the course
    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Course.findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Course removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};