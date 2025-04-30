import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { 
  getThisWeeksTasks, 
  getTodaysTasks, 
  getDailyQuote, 
  sortTasks, 
  updateTaskStatus,
  calculateStudyStreak,
  formatDate
} from '../lib/utils';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import TaskSummary from '../components/dashboard/TaskSummary';
import StudyStreakTracker from '../components/dashboard/StudyStreakTracker';
import UpcomingTasksWidget from '../components/dashboard/UpcomingTasksWidget';
import CourseProgressWidget from '../components/dashboard/CourseProgressWidget';
import { Task, Course, StudySession, User } from '../lib/types';
import { getAll, update, getUserSettings, saveUserSettings } from '../lib/db';
import PageContainer from '../components/layout/PageContainer';

const Dashboard = () => {
  const { state, dispatch } = useAppContext();
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const quote = getDailyQuote();
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        setIsLoading(true);
        
        // Load courses if not already loaded
        if (state.courses.length === 0) {
          const courses = await getAll('courses');
          dispatch({ type: 'SET_COURSES', payload: courses });
        }
        
        // Load tasks if not already loaded
        if (state.tasks.length === 0) {
          const tasks = await getAll('tasks');
          dispatch({ type: 'SET_TASKS', payload: tasks });
        }
        
        // Load flashcards if not already loaded
        if (state.flashcards.length === 0) {
          const flashcards = await getAll('flashcards');
          dispatch({ type: 'SET_FLASHCARDS', payload: flashcards });
        }
        
        // Load user settings if not already loaded
        if (!state.user) {
          const user = await getUserSettings();
          if (user) {
            dispatch({ type: 'SET_USER', payload: user });
          } else {
            // Create default user if none exists
            const defaultUser: User = {
              displayName: 'Student',
              theme: 'system',
              studyStreak: 0,
            };
            await saveUserSettings(defaultUser);
            dispatch({ type: 'SET_USER', payload: defaultUser });
          }
        }
        
        // Update task statuses based on due dates
        const updatedTasks = state.tasks.map(updateTaskStatus);
        const tasksToUpdate = updatedTasks.filter(
          (updatedTask, index) => updatedTask !== state.tasks[index]
        );
        
        // Save any tasks with updated statuses
        for (const task of tasksToUpdate) {
          await update('tasks', task);
          dispatch({ type: 'UPDATE_TASK', payload: task });
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard data' });
        dispatch({ type: 'SET_LOADING', payload: false });
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Process data for dashboard display
  useEffect(() => {
    // Get today's and this week's tasks
    const today = getTodaysTasks(state.tasks);
    const thisWeek = getThisWeeksTasks(state.tasks);
    
    setTodaysTasks(sortTasks(today));
    setWeekTasks(sortTasks(thisWeek));
    
    // Get recent courses (limit to 3)
    const sorted = [...state.courses]
      .filter(course => !course.isArchived)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 3);
      
    setRecentCourses(sorted);
    
    // Calculate study streak
    if (state.user) {
      const streak = calculateStudyStreak(state.user.lastStudyDate);
      setStudyStreak(streak);
    }
  }, [state.tasks, state.courses, state.user]);

  // Mark task as completed
  const handleCompleteTask = async (taskId: string) => {
    try {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const updatedTask = { ...task, status: 'completed' as const };
      await update('tasks', updatedTask);
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      
      // Update study streak if this was today's task
      if (state.user) {
        const now = Date.now();
        const updatedUser = {
          ...state.user,
          lastStudyDate: now,
          studyStreak: calculateStudyStreak(now) + 1,
        };
        await saveUserSettings(updatedUser);
        dispatch({ type: 'SET_USER', payload: updatedUser });
        setStudyStreak(updatedUser.studyStreak);
      }
    } catch (error) {
      console.error('Error completing task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete task' });
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <PageContainer>
      {/* Welcome header with subtle gradient background */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-700 theme-pink:from-pink-50 theme-pink:to-pink-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <motion.h1 
              className="text-3xl font-bold text-gray-900 dark:text-white theme-pink:text-pink-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome back, {state.user?.displayName || 'Student'}!
            </motion.h1>
            <motion.p 
              className="text-gray-600 dark:text-gray-300 theme-pink:text-pink-500 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {formatDate(Date.now(), 'long')}
            </motion.p>
          </div>
          
          <motion.div 
            className="mt-3 md:mt-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link to="/calendar">
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column - Tasks & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Tasks */}
            <motion.div variants={cardVariants}>
              <Card className="shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 theme-pink:border-pink-200">
                <div className="bg-white dark:bg-gray-800 theme-pink:bg-white px-6 py-4 border-b border-gray-100 dark:border-gray-700 theme-pink:border-pink-100">
                  <CardTitle>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Today's Tasks
                    </div>
                  </CardTitle>
                </div>
                <CardContent className="p-6">
                  {todaysTasks.length > 0 ? (
                    <div className="space-y-3">
                      {todaysTasks.map(task => (
                        <TaskSummary
                          key={task.id}
                          task={task}
                          onComplete={() => handleCompleteTask(task.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 theme-pink:bg-pink-50 rounded-lg">
                      <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 theme-pink:text-pink-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="mt-4 text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">No tasks scheduled for today.</p>
                      <Link to="/calendar" className="mt-2 inline-flex items-center px-4 py-2 text-sm font-medium text-amber-600 bg-white dark:text-amber-400 dark:bg-gray-800 theme-pink:text-pink-600 theme-pink:bg-white rounded-md border border-amber-300 dark:border-amber-700 theme-pink:border-pink-300 hover:bg-amber-50 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50">
                        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add a task
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Progress Widget */}
            <motion.div variants={cardVariants}>
              <CourseProgressWidget 
                courses={state.courses}
                flashcards={state.flashcards}
                tasks={state.tasks}
              />
            </motion.div>
            
            {/* Upcoming Tasks */}
            <motion.div variants={cardVariants}>
              <UpcomingTasksWidget 
                tasks={state.tasks}
                courses={state.courses}
                onCompleteTask={handleCompleteTask}
              />
            </motion.div>
          </div>
          
          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Study Streak Tracker */}
            <motion.div variants={cardVariants}>
              <StudyStreakTracker 
                lastStudyDate={state.user?.lastStudyDate}
                studyStreak={studyStreak}
              />
            </motion.div>
            
            {/* Quote of the Day */}
            <motion.div variants={cardVariants}>
              <Card className="shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 theme-pink:border-pink-200">
                <div className="bg-white dark:bg-gray-800 theme-pink:bg-white px-6 py-4 border-b border-gray-100 dark:border-gray-700 theme-pink:border-pink-100">
                  <CardTitle>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Quote of the Day
                    </div>
                  </CardTitle>
                </div>
                <CardContent className="p-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 theme-pink:from-white theme-pink:to-pink-50">
                  <div className="py-3">
                    <p className="italic text-gray-700 dark:text-gray-300 theme-pink:text-pink-700 text-lg">"{quote.quote}"</p>
                    <p className="text-right text-gray-600 dark:text-gray-400 theme-pink:text-pink-500 mt-2 font-medium">- {quote.author}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Recent Courses */}
            <motion.div variants={cardVariants}>
              <Card className="shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 theme-pink:border-pink-200">
                <div className="bg-white dark:bg-gray-800 theme-pink:bg-white px-6 py-4 border-b border-gray-100 dark:border-gray-700 theme-pink:border-pink-100">
                  <CardTitle>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Recent Courses
                    </div>
                  </CardTitle>
                </div>
                <CardContent className="p-6">
                  {recentCourses.length > 0 ? (
                    <div className="space-y-3">
                      {recentCourses.map(course => (
                        <div 
                          key={course.id} 
                          className="flex items-center p-3 rounded-lg bg-white dark:bg-gray-800 theme-pink:bg-white hover:bg-gray-50 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50 shadow-sm border border-gray-100 dark:border-gray-700 theme-pink:border-pink-100 transition-colors"
                        >
                          <div className={`w-12 h-12 rounded-lg bg-course-${course.colorTheme || 'amber'} flex items-center justify-center text-lg font-bold ${
                            ['yellow', 'lime', 'amber'].includes(course.colorTheme) ? 'text-gray-900' : 'text-white'
                          }`}>
                            {course.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4 flex-1">
                            <Link to={`/courses/${course.id}/notes`} className="font-medium text-gray-800 dark:text-gray-200 theme-pink:text-pink-800 hover:text-amber-600 dark:hover:text-amber-400 theme-pink:hover:text-pink-600">
                              {course.name}
                            </Link>
                            <p className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-pink-500">
                              {course.instructor || 'No instructor'} • {course.schedule || 'No schedule'}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-center mt-6">
                        <Link to="/courses" className="inline-flex items-center px-4 py-2 text-sm font-medium text-amber-600 bg-white dark:text-amber-400 dark:bg-gray-800 theme-pink:text-pink-600 theme-pink:bg-white rounded-md border border-amber-300 dark:border-amber-700 theme-pink:border-pink-300 hover:bg-amber-50 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50">
                          <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          View all courses
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 theme-pink:bg-pink-50 rounded-lg">
                      <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 theme-pink:text-pink-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p className="mt-4 text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">You haven't added any courses yet.</p>
                      <Link to="/courses" className="mt-2 inline-flex items-center px-4 py-2 text-sm font-medium text-amber-600 bg-white dark:text-amber-400 dark:bg-gray-800 theme-pink:text-pink-600 theme-pink:bg-white rounded-md border border-amber-300 dark:border-amber-700 theme-pink:border-pink-300 hover:bg-amber-50 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50">
                        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add your first course
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}
    </PageContainer>
  );
};

export default Dashboard;