// CalendarPage.tsx - Web version with task management
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { Task, Course } from '../lib/types';
import { add, update, remove } from '../lib/db';
import { generateId, getCurrentTimestamp, formatDate } from '../lib/utils';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import TaskDetailModal from '../components/task/TaskDetailModal';

const CalendarPage = () => {
  const { state, dispatch } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [taskType, setTaskType] = useState<'assignment' | 'exam' | 'quiz' | 'project' | 'reading' | 'other'>('assignment');
  const [priority, setPriority] = useState(2);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const courses = state.courses.filter(c => !c.isArchived);
  const pendingTasks = state.tasks.filter(t => t.status !== 'completed').sort((a, b) => a.dueDate - b.dueDate);
  const completedTasks = state.tasks.filter(t => t.status === 'completed');

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setSelectedCourse('');
    setTaskType('assignment');
    setPriority(2);
    setDueDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setSelectedCourse(task.courseId || '');
    setTaskType(task.type);
    setPriority(task.priority);
    setDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      const now = getCurrentTimestamp();
      const dueDateTimestamp = new Date(dueDate).getTime();
      
      if (editingTask) {
        const updatedTask: Task = {
          ...editingTask,
          title: taskTitle,
          description: taskDescription,
          courseId: selectedCourse || undefined,
          type: taskType,
          priority,
          dueDate: dueDateTimestamp,
          updatedAt: now,
        };
        await update('tasks', updatedTask);
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      } else {
        const newTask: Task = {
          id: generateId(),
          title: taskTitle,
          description: taskDescription,
          courseId: selectedCourse || undefined,
          type: taskType,
          status: 'pending',
          priority,
          dueDate: dueDateTimestamp,
          createdAt: now,
          updatedAt: now,
        };
        await add('tasks', newTask);
        dispatch({ type: 'ADD_TASK', payload: newTask });
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await remove('tasks', task.id);
        dispatch({ type: 'DELETE_TASK', payload: task.id });
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updatedTask = { ...task, status: newStatus, updatedAt: getCurrentTimestamp() };
    await update('tasks', updatedTask);
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  };

  return (
    <div className="calendar-container p-6 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-2">
            <span className="gradient-text">Calendar & Tasks</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your assignments, exams, and deadlines
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pending Tasks</p>
                <p className="text-4xl font-bold text-orange-600">{pendingTasks.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completed</p>
                <p className="text-4xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Tasks</p>
                <p className="text-4xl font-bold text-purple-600">{state.tasks.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Task Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={handleAddTask} variant="primary">
            + Add Task
          </Button>
        </div>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Pending Tasks</h2>
            <div className="space-y-4">
              {pendingTasks.map((task, index) => {
                const course = courses.find(c => c.id === task.courseId);
                const isOverdue = task.dueDate < new Date().setHours(0, 0, 0, 0);
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={isOverdue ? 'ring-2 ring-red-500' : ''}>
                      <CardContent>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {course && (
                                <span 
                                  className="px-2 py-1 rounded text-xs font-semibold text-white"
                                  style={{ backgroundColor: `var(--course-${course.colorTheme}, #3b82f6)` }}
                                >
                                  {course.name}
                                </span>
                              )}
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                {task.type}
                              </span>
                              {task.priority === 1 && (
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs font-semibold">
                                  High Priority
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold mb-1">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                            )}
                            <p className={`text-sm font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                              Due: {formatDate(task.dueDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleToggleStatus(task)}
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                task.status === 'completed'
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                              }`}
                            >
                              {task.status === 'completed' && (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTask(task)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteTask(task)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Completed Tasks</h2>
            <div className="space-y-4">
              {completedTasks.slice(0, 10).map((task, index) => {
                const course = courses.find(c => c.id === task.courseId);
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="opacity-75">
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold line-through">{task.title}</h3>
                              {course && (
                                <span className="text-xs text-gray-500">{course.name}</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(task)}
                          >
                            Undo
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {state.tasks.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No tasks yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">Add tasks to see them here</p>
              <Button onClick={handleAddTask} variant="primary">
                + Add Your First Task
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Enter task description"
              />
            </div>

            {courses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">No Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="reading">Reading</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={1}>High</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveTask}>
                Save Task
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarPage;
