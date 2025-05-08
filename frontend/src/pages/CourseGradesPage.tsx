import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getAll, add, update, remove } from '../lib/db';
import { Course, Task, TaskType } from '../lib/types';
import { generateId, getCurrentTimestamp } from '../lib/utils';
import { percentageToLetterGrade, formatPercentage, getGradeColor } from '../lib/gradeUtils';
import Button from '../components/common/Button';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import Modal, { ModalFooter } from '../components/common/Modal';
import PercentageGradeInput from '../components/academic-records/PercentageGradeInput';
import PageContainer from '../components/layout/PageContainer';

const CourseGradesPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddGradeModalOpen, setIsAddGradeModalOpen] = useState(false);
  const [isEditGradeModalOpen, setIsEditGradeModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current grade calculation
  const [currentGradePercentage, setCurrentGradePercentage] = useState<number | undefined>(undefined);
  const [currentLetterGrade, setCurrentLetterGrade] = useState<string | undefined>(undefined);
  const [targetGrade, setTargetGrade] = useState<number | undefined>(undefined);
  const [remainingWeight, setRemainingWeight] = useState<number>(0);
  const [neededGrade, setNeededGrade] = useState<number | undefined>(undefined);
  
  // Filtered task type view
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | 'all'>('all');
  
  // Form states for adding/editing grades
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>('assignment');
  const [newTaskWeight, setNewTaskWeight] = useState<number | undefined>(undefined);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskGrade, setNewTaskGrade] = useState<number | undefined>(undefined);
  const [newTaskLetterGrade, setNewTaskLetterGrade] = useState<string | undefined>(undefined);
  
  // Load course and related tasks
  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Find the course
        const foundCourse = state.courses.find(c => c.id === courseId);
        if (!foundCourse) {
          setError('Course not found');
          setIsLoading(false);
          return;
        }
        setCourse(foundCourse);
        
        // Load tasks for this course
        let courseTasks = state.tasks.filter(task => task.courseId === courseId);
        if (courseTasks.length === 0) {
          // If not in state, get from DB
          courseTasks = await getAll('tasks', task => task.courseId === courseId);
          dispatch({ type: 'SET_TASKS', payload: courseTasks });
        }
        
        // Sort tasks by due date
        courseTasks.sort((a, b) => a.dueDate - b.dueDate);
        setTasks(courseTasks);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading course grades data:', err);
        setError('Failed to load course data');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [courseId, state.courses]);
  
  // Calculate current grade whenever tasks change
  useEffect(() => {
    calculateCurrentGrade();
  }, [tasks]);
  
  // Calculate current grade based on completed assignments and their weights
  const calculateCurrentGrade = () => {
    // Filter tasks that have grades and weights
    const gradedTasks = tasks.filter(task => 
      task.status === 'completed' && 
      task.grade !== undefined && 
      task.weight !== undefined
    );
    
    if (gradedTasks.length === 0) {
      setCurrentGradePercentage(undefined);
      setCurrentLetterGrade(undefined);
      return;
    }
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    gradedTasks.forEach(task => {
      totalWeight += task.weight!;
      weightedSum += (task.grade! * task.weight!) / 100;
    });
    
    // Calculate remaining weight from ungraded tasks
    const ungradedTasks = tasks.filter(task => 
      (task.status === 'pending' || task.status === 'overdue') && 
      task.weight !== undefined
    );
    
    const remainingWeightValue = ungradedTasks.reduce((sum, task) => sum + (task.weight || 0), 0);
    setRemainingWeight(remainingWeightValue);
    
    // Calculate current percentage if we have weights
    if (totalWeight > 0) {
      const percentage = (weightedSum / totalWeight) * 100;
      setCurrentGradePercentage(percentage);
      setCurrentLetterGrade(percentageToLetterGrade(percentage));
      
      // Calculate needed grade to hit target
      if (targetGrade !== undefined && remainingWeightValue > 0) {
        // Formula: (target * totalPossibleWeight - currentPoints) / remainingWeight
        const totalPossibleWeight = totalWeight + remainingWeightValue;
        const currentPoints = weightedSum;
        const needed = ((targetGrade! * totalPossibleWeight / 100) - currentPoints) / (remainingWeightValue / 100);
        
        // Cap at 100%
        setNeededGrade(Math.min(Math.max(needed, 0), 100));
      } else {
        setNeededGrade(undefined);
      }
    } else {
      setCurrentGradePercentage(undefined);
      setCurrentLetterGrade(undefined);
      setNeededGrade(undefined);
    }
  };
  
  // Add a new graded task
  const handleAddGradedTask = async () => {
    if (!courseId || !newTaskTitle || newTaskWeight === undefined) {
      setError('Please fill out all required fields');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Parse due date
      const dueDate = newTaskDueDate ? new Date(newTaskDueDate).getTime() : Date.now();
      
      const now = getCurrentTimestamp();
      const newTask: Task = {
        id: generateId(),
        courseId,
        title: newTaskTitle,
        type: newTaskType,
        dueDate,
        status: 'completed', // Mark as completed since we're adding a grade
        priority: 2, // Medium priority by default
        weight: newTaskWeight,
        grade: newTaskGrade,
        createdAt: now,
        updatedAt: now,
      };
      
      await add('tasks', newTask);
      
      // Update local state
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      
      // Update global state
      dispatch({ type: 'ADD_TASK', payload: newTask });
      
      // Reset form
      setNewTaskTitle('');
      setNewTaskType('assignment');
      setNewTaskWeight(undefined);
      setNewTaskDueDate('');
      setNewTaskGrade(undefined);
      setNewTaskLetterGrade(undefined);
      
      setIsAddGradeModalOpen(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Error adding graded task:', err);
      setError('Failed to add grade');
      setIsLoading(false);
    }
  };
  
  // Update an existing task with grade info
  const handleUpdateGradedTask = async () => {
    if (!currentTask || !newTaskTitle || newTaskWeight === undefined) {
      setError('Please fill out all required fields');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Parse due date
      const dueDate = newTaskDueDate ? new Date(newTaskDueDate).getTime() : currentTask.dueDate;
      
      const updatedTask: Task = {
        ...currentTask,
        title: newTaskTitle,
        type: newTaskType,
        dueDate,
        weight: newTaskWeight,
        grade: newTaskGrade,
        updatedAt: getCurrentTimestamp(),
      };
      
      await update('tasks', updatedTask);
      
      // Update local state
      const updatedTasks = tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
      setTasks(updatedTasks);
      
      // Update global state
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      
      setIsEditGradeModalOpen(false);
      setCurrentTask(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error updating graded task:', err);
      setError('Failed to update grade');
      setIsLoading(false);
    }
  };
  
  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this grade entry?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      await remove('tasks', taskId);
      
      // Update local state
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Update global state
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      
      if (currentTask && currentTask.id === taskId) {
        setCurrentTask(null);
        setIsEditGradeModalOpen(false);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete grade');
      setIsLoading(false);
    }
  };
  
  // Filter tasks based on selected type
  const filteredTasks = selectedTaskType === 'all' 
    ? tasks 
    : tasks.filter(task => task.type === selectedTaskType);
  
  // Reset form states when modal opens
  useEffect(() => {
    if (isAddGradeModalOpen) {
      setNewTaskTitle('');
      setNewTaskType('assignment');
      setNewTaskWeight(undefined);
      setNewTaskDueDate('');
      setNewTaskGrade(undefined);
      setNewTaskLetterGrade(undefined);
    }
  }, [isAddGradeModalOpen]);
  
  // Set form values when editing
  useEffect(() => {
    if (isEditGradeModalOpen && currentTask) {
      setNewTaskTitle(currentTask.title);
      setNewTaskType(currentTask.type);
      setNewTaskWeight(currentTask.weight);
      setNewTaskDueDate(currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().split('T')[0] : '');
      setNewTaskGrade(currentTask.grade);
      setNewTaskLetterGrade(currentTask.grade ? percentageToLetterGrade(currentTask.grade) : undefined);
    }
  }, [isEditGradeModalOpen, currentTask]);
  
  // Handle grade input change
  const handleGradeChange = (percentage: number | undefined, letterGrade: string | undefined) => {
    setNewTaskGrade(percentage);
    setNewTaskLetterGrade(letterGrade);
  };
  
  // Handle target grade change
  const handleTargetGradeChange = (percentage: number | undefined) => {
    setTargetGrade(percentage);
  };
  
  // Format task type for display
  const formatTaskType = (type: TaskType): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Get appropriate color for task type
  const getTaskTypeColor = (type: TaskType): string => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 theme-pink:bg-blue-100 theme-pink:text-blue-800';
      case 'exam':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 theme-pink:bg-red-100 theme-pink:text-red-800';
      case 'quiz':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 theme-pink:bg-purple-100 theme-pink:text-purple-800';
      case 'project':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 theme-pink:bg-green-100 theme-pink:text-green-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 theme-pink:bg-gray-100 theme-pink:text-gray-800';
    }
  };
  
  // Calculate the overall course grade (weighted average)
  const calculateTotalWeight = (): number => {
    return tasks.reduce((sum, task) => sum + (task.weight || 0), 0);
  };

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white theme-pink:text-pink-600">
            {course ? `${course.name} - Grades` : 'Course Grades'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">
            Track and manage your grades for this course
          </p>
        </div>
        
        <div className="mt-3 md:mt-0 space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/courses/${courseId}/notes`)}
          >
            View Notes
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/courses/${courseId}/flashcards`)}
          >
            View Flashcards
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddGradeModalOpen(true)}
          >
            Add Grade
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded theme-pink:bg-pink-100 theme-pink:text-red-700">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Current Grade Summary Card */}
        <Card className="lg:col-span-1">
          <CardTitle>Grade Summary</CardTitle>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wider">
                  Current Grade
                </h3>
                {currentGradePercentage !== undefined ? (
                  <>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white theme-pink:text-pink-600">
                      {formatPercentage(currentGradePercentage)}
                    </p>
                    <p className={`mt-1 text-xl font-medium ${getGradeColor(currentLetterGrade)}`}>
                      {currentLetterGrade}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-lg text-gray-600 dark:text-gray-400 theme-pink:text-pink-400">
                    No grades recorded yet
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wider">
                  Total Weight Recorded
                </h3>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white theme-pink:text-pink-600">
                  {calculateTotalWeight()}%
                </p>
                {calculateTotalWeight() > 100 && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 theme-pink:text-red-500">
                    Warning: Total weight exceeds 100%
                  </p>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 theme-pink:border-pink-100">
                <h3 className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wider mb-2">
                  Grade Calculation
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <label htmlFor="targetGrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                      Target Grade
                    </label>
                    <PercentageGradeInput 
                      initialValue={targetGrade}
                      onChange={(percentage) => handleTargetGradeChange(percentage)}
                    />
                  </div>
                  
                  {neededGrade !== undefined && (
                    <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900 theme-pink:bg-pink-50 rounded-lg">
                      <p className="text-sm text-gray-800 dark:text-gray-200 theme-pink:text-pink-800">
                        You need to score an average of <span className="font-semibold">{formatPercentage(neededGrade)}</span> on the remaining {formatPercentage(remainingWeight)} of the course to achieve your target grade of {formatPercentage(targetGrade!)}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Grades List */}
        <div className="lg:col-span-3">
          <Card>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 theme-pink:border-pink-200 flex flex-wrap justify-between items-center">
              <CardTitle className="mb-0">Grade Entries</CardTitle>
              
              <div className="flex items-center mt-2 md:mt-0">
                <span className="text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-500 mr-2">Filter:</span>
                <select
                  value={selectedTaskType}
                  onChange={(e) => setSelectedTaskType(e.target.value as TaskType | 'all')}
                  className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 theme-pink:bg-white shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="assignment">Assignments</option>
                  <option value="exam">Exams</option>
                  <option value="quiz">Quizzes</option>
                  <option value="project">Projects</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <CardContent>
              {isLoading && tasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent theme-pink:border-pink-400 theme-pink:border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">Loading grades...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 theme-pink:text-pink-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white theme-pink:text-pink-600">
                    No Grades Recorded
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">
                    {selectedTaskType === 'all'
                      ? "You haven't recorded any grades for this course yet."
                      : `No ${formatTaskType(selectedTaskType).toLowerCase()} grades found.`}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsAddGradeModalOpen(true)}
                  >
                    Record Your First Grade
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 theme-pink:divide-pink-200">
                    <thead className="bg-gray-50 dark:bg-gray-800 theme-pink:bg-pink-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-600 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-600 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-600 uppercase tracking-wider">
                          Weight
                        </th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-600 uppercase tracking-wider">
                          Grade
                        </th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 theme-pink:bg-white divide-y divide-gray-200 dark:divide-gray-700 theme-pink:divide-pink-100">
                      {filteredTasks.map(task => (
                        <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white theme-pink:text-gray-800">
                              {task.title}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTaskTypeColor(task.type)}`}>
                              {task.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-900 dark:text-white theme-pink:text-gray-800">
                              {task.weight !== undefined ? `${task.weight}%` : 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            {task.grade !== undefined ? (
                              <div className="flex flex-col items-center">
                                <span className="text-sm text-gray-900 dark:text-white theme-pink:text-gray-800">
                                  {formatPercentage(task.grade)}
                                </span>
                                                <span className={`text-xs font-medium ${getGradeColor(percentageToLetterGrade(task.grade))}`}>
                                  {percentageToLetterGrade(task.grade)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-gray-500">
                                Not graded
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-gray-500">
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setCurrentTask(task);
                                setIsEditGradeModalOpen(true);
                              }}
                              className="text-primary-600 dark:text-primary-400 theme-pink:text-pink-500 hover:text-primary-800 dark:hover:text-primary-300 theme-pink:hover:text-pink-700 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 dark:text-red-400 theme-pink:text-red-500 hover:text-red-800 dark:hover:text-red-300 theme-pink:hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Grade Modal */}
      <Modal
        isOpen={isAddGradeModalOpen}
        onClose={() => setIsAddGradeModalOpen(false)}
        title="Add Grade Entry"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
              Assignment/Test Name *
            </label>
            <input
              type="text"
              id="taskTitle"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              placeholder="Midterm Exam"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="taskType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Type *
              </label>
              <select
                id="taskType"
                value={newTaskType}
                onChange={(e) => setNewTaskType(e.target.value as TaskType)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              >
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="taskWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Weight (%) *
              </label>
              <input
                type="number"
                id="taskWeight"
                min="0"
                max="100"
                step="0.1"
                value={newTaskWeight !== undefined ? newTaskWeight : ''}
                onChange={(e) => setNewTaskWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
                placeholder="20"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="taskDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
              Date
            </label>
            <input
              type="date"
              id="taskDueDate"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="taskGrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
              Grade (%)
            </label>
            <PercentageGradeInput 
              onChange={handleGradeChange}
            />
          </div>
        </div>
        
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddGradeModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddGradedTask}
          >
            Add Grade
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Edit Grade Modal */}
      <Modal
        isOpen={isEditGradeModalOpen}
        onClose={() => {
          setIsEditGradeModalOpen(false);
          setCurrentTask(null);
        }}
        title="Edit Grade Entry"
      >
        {currentTask && (
          <div className="space-y-4">
            <div>
              <label htmlFor="editTaskTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Assignment/Test Name *
              </label>
              <input
                type="text"
                id="editTaskTitle"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="editTaskType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                  Type *
                </label>
                <select
                  id="editTaskType"
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value as TaskType)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
                >
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                  <option value="quiz">Quiz</option>
                  <option value="project">Project</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="editTaskWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                  Weight (%) *
                </label>
                <input
                  type="number"
                  id="editTaskWeight"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newTaskWeight !== undefined ? newTaskWeight : ''}
                  onChange={(e) => setNewTaskWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="editTaskDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Date
              </label>
              <input
                type="date"
                id="editTaskDueDate"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="editTaskGrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Grade (%)
              </label>
              <PercentageGradeInput 
                initialValue={newTaskGrade}
                onChange={handleGradeChange}
              />
            </div>
          </div>
        )}
        
        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsEditGradeModalOpen(false);
              setCurrentTask(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateGradedTask}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </PageContainer>
  );
};

export default CourseGradesPage;