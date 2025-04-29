import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const Dashboard = () => {
  const { state, dispatch } = useAppContext();
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const quote = getDailyQuote();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
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
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard data' });
        dispatch({ type: 'SET_LOADING', payload: false });
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {state.user?.displayName || 'Student'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {formatDate(Date.now(), 'long')}
          </p>
        </div>
        
        <div className="mt-3 md:mt-0">
          <Link to="/calendar">
            <Button
              variant="primary"
              leftIcon={
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            >
              Add Task
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <Card>
            <CardTitle>Today's Tasks</CardTitle>
            <CardContent>
              {todaysTasks.length > 0 ? (
                <div className="space-y-2">
                  {todaysTasks.map(task => (
                    <TaskSummary
                      key={task.id}
                      task={task}
                      onComplete={() => handleCompleteTask(task.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <p>No tasks scheduled for today.</p>
                  <Link to="/calendar" className="text-purple-600 dark:text-purple-400 hover:underline mt-2 inline-block">
                    Add a task
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Progress Widget */}
          <CourseProgressWidget 
            courses={state.courses}
            flashcards={state.flashcards}
            tasks={state.tasks}
          />
          
          {/* Upcoming Tasks */}
          <UpcomingTasksWidget 
            tasks={state.tasks}
            courses={state.courses}
            onCompleteTask={handleCompleteTask}
          />
        </div>
        
        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Study Streak Tracker */}
          <StudyStreakTracker 
            lastStudyDate={state.user?.lastStudyDate}
            studyStreak={studyStreak}
          />
          
          {/* Quote of the Day */}
          <Card>
            <CardTitle>Quote of the Day</CardTitle>
            <CardContent>
              <div className="py-3">
                <p className="italic text-gray-700 dark:text-gray-300">"{quote.quote}"</p>
                <p className="text-right text-gray-600 dark:text-gray-400 mt-2">- {quote.author}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Courses */}
          <Card>
            <CardTitle>Recent Courses</CardTitle>
            <CardContent>
              {recentCourses.length > 0 ? (
                <div className="space-y-3">
                  {recentCourses.map(course => (
                    <div key={course.id} className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className={`w-10 h-10 rounded-lg bg-course-${course.colorTheme || 'purple'} flex items-center justify-center text-lg font-bold ${
                        ['yellow', 'lime', 'amber'].includes(course.colorTheme) ? 'text-gray-900' : 'text-white'
                      }`}>
                        {course.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3 flex-1">
                        <Link to={`/courses/${course.id}/notes`} className="font-medium text-gray-800 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
                          {course.name}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {course.instructor || 'No instructor'} • {course.schedule || 'No schedule'}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center mt-4">
                    <Link to="/courses" className="text-purple-600 dark:text-purple-400 hover:underline">
                      View all courses
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <p>You haven't added any courses yet.</p>
                  <Link to="/courses" className="text-purple-600 dark:text-purple-400 hover:underline mt-2 inline-block">
                    Add your first course
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;