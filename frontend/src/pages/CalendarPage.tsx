import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getAll, add, update, remove } from '../lib/db';
import { Task, TaskType, TaskStatus } from '../lib/types';
import { generateId, getCurrentTimestamp, formatDate } from '../lib/utils';
import Button from '../components/common/Button';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import Modal, { ModalFooter } from '../components/common/Modal';
import TaskSummary from '../components/dashboard/TaskSummary';
import { motion } from 'framer-motion';
import PageContainer from '../components/layout/PageContainer';
import TaskDetailModal from '../components/task/TaskDetailModal';

// Helper for creating a calendar
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Create array of days
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ day: null, date: null });
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({ day, date });
  }
  
  return days;
};

const CalendarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, dispatch } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarDays, setCalendarDays] = useState<{ day: number | null; date: Date | null }[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if a specific course filter is applied
  const filterCourseId = searchParams.get('course');
  
  // Task types and their colors
  const taskTypes: { type: TaskType; label: string; color: string }[] = [
    { type: 'assignment', label: 'Assignment', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { type: 'exam', label: 'Exam', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    { type: 'quiz', label: 'Quiz', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    { type: 'project', label: 'Project', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { type: 'reading', label: 'Reading', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { type: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  ];
  
  // Load tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load courses if not already loaded
        if (state.courses.length === 0) {
          const courses = await getAll('courses');
          dispatch({ type: 'SET_COURSES', payload: courses });
        }
        
        // Load all tasks
        const allTasks = await getAll('tasks');
        
        // Apply course filter if specified
        const filteredTasks = filterCourseId
          ? allTasks.filter(task => task.courseId === filterCourseId)
          : allTasks;
        
        setTasks(filteredTasks);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks');
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, [filterCourseId]);
  
  // Generate calendar when month/year changes
  useEffect(() => {
    const days = generateCalendarDays(currentYear, currentMonth);
    setCalendarDays(days);
  }, [currentYear, currentMonth]);
  
  // Update tasks for selected date
  useEffect(() => {
    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const tasksForDate = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate >= startOfDay && taskDate <= endOfDay;
      });
      
      setTasksForSelectedDate(tasksForDate);
    } else {
      setTasksForSelectedDate([]);
    }
  }, [selectedDate, tasks]);
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Go to current month
  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };
  
  // Format month and year for display
  const formatMonthYear = (month: number, year: number) => {
    return new Date(year, month).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };
  
  // Check if date has tasks
  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= startOfDay && taskDate <= endOfDay;
    });
  };
  
  // Check if date is today
  const isToday = (date: Date | null) => {
    if (!date) return false;
    
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Check if date is selected
  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // Get task type label
  const getTaskTypeLabel = (type: TaskType) => {
    const taskType = taskTypes.find(t => t.type === type);
    return taskType ? taskType.label : 'Other';
  };
  
  // Get task type color
  const getTaskTypeColor = (type: TaskType) => {
    const taskType = taskTypes.find(t => t.type === type);
    return taskType ? taskType.color : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };
  
  // Get course color for a task
  const getTaskCourseColor = (task: Task) => {
    if (!task.courseId) return null;
    
    const course = state.courses.find(c => c.id === task.courseId);
    if (!course) return null;
    
    const colorTheme = course.colorTheme;
    const bgClass = `bg-course-${colorTheme}`;
    const textClass = ['yellow', 'lime', 'amber'].includes(colorTheme) ? 'text-gray-900' : 'text-white';
    
    return { 
      bgClass, 
      textClass, 
      name: course.name,
      colorTheme
    };
  };
  
  const handleAddTask = async (taskData: {
    title: string;
    description: string;
    dueDate: string;
    dueTime: string;
    type: TaskType;
    courseId?: string;
    priority: number;
    weight?: number;
  }) => {
    try {
      setIsLoading(true);
      
      // Parse date and time
      const [year, month, day] = taskData.dueDate.split('-').map(Number);
      const [hours, minutes] = taskData.dueTime.split(':').map(Number);
      
      const dueDate = new Date(year, month - 1, day, hours, minutes);
      
      const now = getCurrentTimestamp();
      const newTask: Task = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description,
        dueDate: dueDate.getTime(),
        type: taskData.type,
        courseId: taskData.courseId,
        status: 'pending',
        priority: taskData.priority,
        weight: taskData.weight,
        createdAt: now,
        updatedAt: now,
      };
      
      await add('tasks', newTask);
      setTasks([...tasks, newTask]);
      setIsAddTaskModalOpen(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
      setIsLoading(false);
    }
  };
  
  // Handle updating a task
  const handleUpdateTask = async (taskData: {
    title: string;
    description: string;
    dueDate: string;
    dueTime: string;
    type: TaskType;
    courseId?: string;
    priority: number;
    weight?: number;
  }) => {
    if (!currentTask) return;
    
    try {
      setIsLoading(true);
      
      // Parse date and time
      const [year, month, day] = taskData.dueDate.split('-').map(Number);
      const [hours, minutes] = taskData.dueTime.split(':').map(Number);
      
      const dueDate = new Date(year, month - 1, day, hours, minutes);
      
      const updatedTask: Task = {
        ...currentTask,
        title: taskData.title,
        description: taskData.description,
        dueDate: dueDate.getTime(),
        type: taskData.type,
        courseId: taskData.courseId,
        priority: taskData.priority,
        weight: taskData.weight,
        updatedAt: getCurrentTimestamp(),
      };
      
      await update('tasks', updatedTask);
      setTasks(tasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
      setIsEditTaskModalOpen(false);
      setCurrentTask(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
      setIsLoading(false);
    }
  };
  
  // Handle deleting a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      
      await remove('tasks', taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      
      if (currentTask && currentTask.id === taskId) {
        setCurrentTask(null);
        setIsEditTaskModalOpen(false);
        setIsTaskDetailModalOpen(false);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
      setIsLoading(false);
    }
  };
  
  // Handle marking a task as complete/incomplete
  const handleToggleTaskComplete = async (task: Task) => {
    try {
      const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
      
      const updatedTask: Task = {
        ...task,
        status: newStatus,
        updatedAt: getCurrentTimestamp(),
      };
      
      await update('tasks', updatedTask);
      setTasks(tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)));
      
      // Update current task if it's the same
      if (currentTask && currentTask.id === task.id) {
        setCurrentTask(updatedTask);
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status');
    }
  };
  
  // Handle opening task details modal
  const handleOpenTaskDetails = (task: Task) => {
    setCurrentTask(task);
    setIsTaskDetailModalOpen(true);
  };
  
  // Handle opening task edit modal
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsEditTaskModalOpen(true);
    // Close detail modal if open
    if (isTaskDetailModalOpen) {
      setIsTaskDetailModalOpen(false);
    }
  };

  return (
    <PageContainer>
      {/* Animated Header */}
      <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-700 theme-pink:from-pink-50 theme-pink:to-pink-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white theme-pink:text-pink-600">
              Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-300 theme-pink:text-pink-500 mt-1">
              Manage your tasks and deadlines
            </p>
          </motion.div>

          <motion.div
            className="mt-8 md:mt-0 flex space-x-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              variant="primary"
              onClick={() => {
                setSelectedDate(new Date());
                setIsAddTaskModalOpen(true);
              }}
            >
              Add Task
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-medium text-gray-900 dark:text-white">
                {formatMonthYear(currentMonth, currentYear)}
              </h2>
              
              <div className="flex space-x-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-1.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                  aria-label="Previous month"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                
                <button
                  onClick={goToCurrentMonth}
                  className="p-1.5 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none text-sm"
                >
                  Today
                </button>
                
                <button
                  onClick={goToNextMonth}
                  className="p-1.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                  aria-label="Next month"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const tasksForDay = getTasksForDate(day.date);
                  const hasOverdueTasks = tasksForDay.some(task => task.status === 'overdue');
                  const hasCompletedTasks = tasksForDay.some(task => task.status === 'completed');
                  
                  return (
                    <div
                      key={index}
                      className={`p-1 min-h-[80px] border border-gray-200 dark:border-gray-700 rounded ${
                        day.date
                          ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
                          : 'bg-gray-50 dark:bg-gray-800 cursor-default'
                      } ${isSelected(day.date) ? 'ring-2 ring-primary-500' : ''} ${
                        isToday(day.date)
                          ? 'bg-primary-50 dark:bg-primary-900'
                          : ''
                      }`}
                      onClick={() => day.date && setSelectedDate(day.date)}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-sm ${
                              isToday(day.date)
                                ? 'bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {day.day}
                          </span>
                          
                          {tasksForDay.length > 0 && (
                            <div className="flex space-x-1">
                              {hasOverdueTasks && (
                                <div className="w-2 h-2 rounded-full bg-red-500" title="Overdue tasks"></div>
                              )}
                              {hasCompletedTasks && (
                                <div className="w-2 h-2 rounded-full bg-green-500" title="Completed tasks"></div>
                              )}
                              {tasksForDay.some(task => task.status === 'pending') && (
                                <div className="w-2 h-2 rounded-full bg-blue-500" title="Pending tasks"></div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {tasksForDay.length > 0 && (
                          <div className="mt-1 space-y-1 overflow-hidden">
                            {tasksForDay
                              .sort((a, b) => a.dueDate - b.dueDate)
                              .slice(0, 2)
                              .map(task => {
                                // Get course color if associated with a course
                                const courseColor = getTaskCourseColor(task);
                                
                                return (
                                  <div
                                    key={task.id}
                                    className={`text-xs truncate px-1 py-0.5 rounded ${
                                      task.status === 'completed'
                                        ? 'line-through text-gray-500 dark:text-gray-400'
                                        : task.status === 'overdue'
                                        ? 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900'
                                        : courseColor 
                                          ? `${courseColor.bgClass} ${courseColor.textClass}`
                                          : getTaskTypeColor(task.type)
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenTaskDetails(task);
                                    }}
                                  >
                                    {task.title}
                                  </div>
                                );
                              })}
                            
                            {tasksForDay.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                                +{tasksForDay.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Selected Day Tasks */}
        <div>
          <Card>
            <CardTitle>
              {selectedDate
                ? `Tasks for ${formatDate(selectedDate.getTime(), 'long')}`
                : 'Select a date to view tasks'}
            </CardTitle>
            <CardContent>
              {selectedDate && (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="w-full"
                  >
                    Add Task for This Day
                  </Button>
                </div>
              )}
              
              {tasksForSelectedDate.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  {selectedDate
                    ? 'No tasks scheduled for this day.'
                    : 'Select a date on the calendar to view or add tasks.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {tasksForSelectedDate
                    .sort((a, b) => a.dueDate - b.dueDate)
                    .map(task => {
                      // Get course color for highlighting
                      const courseColor = getTaskCourseColor(task);
                      
                      return (
                        <div
                          key={task.id}
                          className={`border rounded-lg overflow-hidden ${
                            courseColor 
                              ? `border-course-${courseColor.colorTheme}`
                              : 'border-gray-200 dark:border-gray-700 theme-pink:border-pink-200'
                          }`}
                          onClick={() => handleOpenTaskDetails(task)}
                        >
                          <TaskSummary
                            task={task}
                            onComplete={() => handleToggleTaskComplete(task)}
                          />
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add New Task"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Task Title *
            </label>
            <input
              type="text"
              id="taskTitle"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter task title"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="taskDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Due Date *
              </label>
              <input
                type="date"
                id="taskDate"
                defaultValue={selectedDate ? selectedDate.toISOString().split('T')[0] : undefined}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="taskTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Due Time *
              </label>
              <input
                type="time"
                id="taskTime"
                defaultValue="23:59"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="taskType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Task Type *
              </label>
              <select
                id="taskType"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                {taskTypes.map(taskType => (
                  <option key={taskType.type} value={taskType.type}>
                    {taskType.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority *
              </label>
              <select
                id="taskPriority"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="1">High</option>
                <option value="2" selected>Medium</option>
                <option value="3">Low</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="taskCourse" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Course (Optional)
            </label>
            <select
              id="taskCourse"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Not associated with a course</option>
              {state.courses
                .filter(course => !course.isArchived)
                .map(course => (
                  <option 
                    key={course.id} 
                    value={course.id}
                    selected={course.id === filterCourseId}
                  >
                    {course.name}
                  </option>
                ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="taskWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Weight (%) (Optional)
            </label>
            <input
              type="number"
              id="taskWeight"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="e.g. 10 (for 10% of the course grade)"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          
          <div>
            <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (Optional)
            </label>
            <textarea
              id="taskDescription"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter task description"
            ></textarea>
          </div>
        </div>
        
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddTaskModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const titleInput = document.getElementById('taskTitle') as HTMLInputElement;
              const dateInput = document.getElementById('taskDate') as HTMLInputElement;
              const timeInput = document.getElementById('taskTime') as HTMLInputElement;
              const typeSelect = document.getElementById('taskType') as HTMLSelectElement;
              const prioritySelect = document.getElementById('taskPriority') as HTMLSelectElement;
              const courseSelect = document.getElementById('taskCourse') as HTMLSelectElement;
              const weightInput = document.getElementById('taskWeight') as HTMLInputElement;
              const descriptionTextarea = document.getElementById('taskDescription') as HTMLTextAreaElement;
              
              if (
                titleInput && 
                dateInput && 
                timeInput && 
                typeSelect && 
                prioritySelect && 
                titleInput.value.trim() && 
                dateInput.value && 
                timeInput.value
              ) {
                handleAddTask({
                  title: titleInput.value.trim(),
                  description: descriptionTextarea ? descriptionTextarea.value.trim() : '',
                  dueDate: dateInput.value,
                  dueTime: timeInput.value,
                  type: typeSelect.value as TaskType,
                  courseId: courseSelect.value || undefined,
                  priority: parseInt(prioritySelect.value),
                  weight: weightInput.value ? parseFloat(weightInput.value) : undefined
                });
              }
            }}
          >
            Add Task
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setCurrentTask(null);
        }}
        title="Edit Task"
      >
        {currentTask && (
          <div className="space-y-4">
            <div>
              <label htmlFor="editTaskTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Task Title *
              </label>
              <input
                type="text"
                id="editTaskTitle"
                defaultValue={currentTask.title}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="editTaskDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date *
                </label>
                <input
                  type="date"
                  id="editTaskDate"
                  defaultValue={new Date(currentTask.dueDate).toISOString().split('T')[0]}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="editTaskTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Time *
                </label>
                <input
                  type="time"
                  id="editTaskTime"
                  defaultValue={
                    `${new Date(currentTask.dueDate).getHours().toString().padStart(2, '0')}:${
                      new Date(currentTask.dueDate).getMinutes().toString().padStart(2, '0')
                    }`
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="editTaskType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Task Type *
                </label>
                <select
                  id="editTaskType"
                  defaultValue={currentTask.type}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  {taskTypes.map(taskType => (
                    <option key={taskType.type} value={taskType.type}>
                      {taskType.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="editTaskPriority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority *
                </label>
                <select
                  id="editTaskPriority"
                  defaultValue={currentTask.priority}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="1">High</option>
                  <option value="2">Medium</option>
                  <option value="3">Low</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="editTaskCourse" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Course (Optional)
              </label>
              <select
                id="editTaskCourse"
                defaultValue={currentTask.courseId || ''}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Not associated with a course</option>
                {state.courses
                  .filter(course => !course.isArchived)
                  .map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="editTaskWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Weight (%) (Optional)
              </label>
              <input
                type="number"
                id="editTaskWeight"
                defaultValue={currentTask.weight}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="e.g. 10 (for 10% of the course grade)"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            
            <div>
              <label htmlFor="editTaskDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (Optional)
              </label>
              <textarea
                id="editTaskDescription"
                rows={3}
                defaultValue={currentTask.description || ''}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              ></textarea>
            </div>
          </div>
        )}
        
        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsEditTaskModalOpen(false);
              setCurrentTask(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const titleInput = document.getElementById('editTaskTitle') as HTMLInputElement;
              const dateInput = document.getElementById('editTaskDate') as HTMLInputElement;
              const timeInput = document.getElementById('editTaskTime') as HTMLInputElement;
              const typeSelect = document.getElementById('editTaskType') as HTMLSelectElement;
              const prioritySelect = document.getElementById('editTaskPriority') as HTMLSelectElement;
              const courseSelect = document.getElementById('editTaskCourse') as HTMLSelectElement;
              const weightInput = document.getElementById('editTaskWeight') as HTMLInputElement;
              const descriptionTextarea = document.getElementById('editTaskDescription') as HTMLTextAreaElement;
              
              if (
                titleInput && 
                dateInput && 
                timeInput && 
                typeSelect && 
                prioritySelect && 
                titleInput.value.trim() && 
                dateInput.value && 
                timeInput.value
              ) {
                handleUpdateTask({
                  title: titleInput.value.trim(),
                  description: descriptionTextarea ? descriptionTextarea.value.trim() : '',
                  dueDate: dateInput.value,
                  dueTime: timeInput.value,
                  type: typeSelect.value as TaskType,
                  courseId: courseSelect.value || undefined,
                  priority: parseInt(prioritySelect.value),
                  weight: weightInput.value ? parseFloat(weightInput.value) : undefined
                });
              }
            }}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Task Detail Modal */}
      <TaskDetailModal
        task={currentTask}
        courses={state.courses}
        isOpen={isTaskDetailModalOpen}
        onClose={() => {
          setIsTaskDetailModalOpen(false);
          setCurrentTask(null);
        }}
        onComplete={(taskId) => {
          if (currentTask) {
            handleToggleTaskComplete(currentTask);
          }
        }}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </PageContainer>
  );
};

export default CalendarPage;