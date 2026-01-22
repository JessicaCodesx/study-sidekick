import Task, { find, findById, findByIdAndUpdate, findByIdAndRemove } from '../models/Task';
import { findOne } from '../models/Course';

// Get all tasks for a user
export async function getTasks(req, res) {
  try {
    const tasks = await find({ firebaseId: req.user.id });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Get tasks for a course
export async function getTasksByCourse(req, res) {
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
    
    const tasks = await find({ courseId });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Add a new task
export async function addTask(req, res) {
  try {
    const { courseId, title, description, dueDate, type, priority, weight } = req.body;
    
    // If courseId is provided, check if the course exists and belongs to the user
    if (courseId) {
      const course = await findOne({ 
        _id: courseId,
        firebaseId: req.user.id
      });
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
    }
    
    const task = new Task({
      courseId,
      title,
      description,
      dueDate,
      type,
      priority,
      weight,
      firebaseId: req.user.id
    });
    
    // Check if task is already overdue
    const now = new Date();
    if (new Date(dueDate) < now) {
      task.status = 'overdue';
    }
    
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Update a task
export async function updateTask(req, res) {
  try {
    const { title, description, dueDate, type, status, priority, weight, grade } = req.body;
    
    // Find task and check if it exists
    let task = await findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if the task belongs to the user
    if (task.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update fields
    const updateData = {
      title,
      description,
      dueDate,
      type,
      status,
      priority,
      weight,
      grade
    };
    
    // Check if status is being updated to completed
    if (status === 'completed' && task.status !== 'completed') {
      updateData.completedAt = Date.now();
    }
    
    // Check if task is overdue
    if (status !== 'completed' && new Date(dueDate) < new Date()) {
      updateData.status = 'overdue';
    }
    
    const updatedTask = await findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Delete a task
export async function deleteTask(req, res) {
  try {
    // Find task and check if it exists
    let task = await findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if the task belongs to the user
    if (task.firebaseId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}