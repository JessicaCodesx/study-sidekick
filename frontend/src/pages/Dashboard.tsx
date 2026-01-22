// Dashboard.tsx - Premium Web version with stunning UI
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { Task, Course } from '../lib/types';
import { formatDate, daysUntil, getDailyQuote } from '../lib/utils';
import { update } from '../lib/db';
import { getCurrentTimestamp } from '../lib/utils';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import CourseProgressWidget from '../components/dashboard/CourseProgressWidget';
import StudyStreakTracker from '../components/dashboard/StudyStreakTracker';
import UpcomingTasksWidget from '../components/dashboard/UpcomingTasksWidget';
import TaskSummary from '../components/dashboard/TaskSummary';

const Dashboard = () => {
  const { state, dispatch } = useAppContext();
  const [quote] = useState(() => getDailyQuote());

  // Get today's tasks - sorted by priority and overdue status
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysTasks = state.tasks
    .filter(task => 
      task.dueDate >= today.getTime() && 
      task.dueDate < tomorrow.getTime() && 
      task.status !== 'completed'
    )
    .sort((a, b) => {
      // First sort by overdue status (overdue first)
      const aIsOverdue = a.dueDate < today.getTime();
      const bIsOverdue = b.dueDate < today.getTime();
      if (aIsOverdue && !bIsOverdue) return -1;
      if (!aIsOverdue && bIsOverdue) return 1;
      // Then by priority (1 = high, 2 = medium, 3 = low)
      if (a.priority !== b.priority) return a.priority - b.priority;
      // Finally by due time
      return a.dueDate - b.dueDate;
    });

  // Get overdue tasks (for critical alert) - tasks due before today
  const overdueTasks = state.tasks.filter(task => 
    task.dueDate < today.getTime() && 
    task.status !== 'completed'
  );

  // Get high priority tasks due today
  const highPriorityToday = todaysTasks.filter(task => task.priority === 1);

  // Get week's tasks
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weeksTasks = state.tasks.filter(task =>
    task.dueDate >= today.getTime() && 
    task.dueDate < weekEnd.getTime() && 
    task.status !== 'completed'
  );

  // Get recent courses
  const recentCourses = state.courses.filter(c => !c.isArchived).slice(0, 3);

  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    try {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        status: 'completed' as const,
        updatedAt: getCurrentTimestamp(),
      };

      await update('tasks', updatedTask);
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  // Calculate statistics
  const totalCourses = state.courses.filter(c => !c.isArchived).length;
  const totalTasks = state.tasks.filter(t => t.status !== 'completed').length;
  const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
  const totalFlashcards = state.flashcards.length;
  const masteredFlashcards = state.flashcards.filter(fc => fc.confidenceLevel >= 4).length;

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 14,
        mass: 0.8,
      },
    },
  };
  

  return (
    <div className="dashboard-container p-6 overflow-y-auto custom-scrollbar">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto relative z-10"
      >
        {/* Critical Alert Banner for Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 dark:from-red-900/30 dark:via-orange-900/30 dark:to-red-900/30 border-2 border-red-500/50 dark:border-red-400/50 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-red-700 dark:text-red-300 mb-1">
                        {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''} Require Attention!
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        These tasks are past their due date and need immediate attention
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/calendar"
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    View All
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Welcome Header with gradient */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-extrabold mb-3"
            >
              <span className="gradient-text">Welcome back! 👋</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 theme-pink:text-pink-600"
            >
              Ready to continue your studies?
            </motion.p>
          </div>
        </motion.div>

        {/* Daily Quote Card with premium design */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-50"></div>
            <CardContent className="relative text-center py-6">
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl italic font-medium text-gray-800 dark:text-gray-100 theme-pink:text-pink-800 leading-relaxed"
              >
                "{quote.quote}"
              </motion.p>
              {quote.author && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm font-semibold text-purple-600 dark:text-purple-400 theme-pink:text-pink-600 mt-4"
                >
                  — {quote.author}
                </motion.p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics Grid with premium cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Active Courses */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.98 }}
            className="group"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/20 via-blue-400/20 to-cyan-500/20 dark:from-blue-600/30 dark:via-blue-500/30 dark:to-cyan-600/30 h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/30 rounded-full blur-3xl"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Active Courses</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {totalCourses}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks Completed */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500/20 via-emerald-400/20 to-teal-500/20 dark:from-green-600/30 dark:via-emerald-500/30 dark:to-teal-600/30 h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/30 rounded-full blur-3xl"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Tasks Completed</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {completedTasks}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Tasks */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.98 }}
            className="group"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500/20 via-amber-400/20 to-yellow-500/20 dark:from-orange-600/30 dark:via-amber-500/30 dark:to-yellow-600/30 h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/30 rounded-full blur-3xl"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Pending Tasks</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      {totalTasks}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Flashcards Mastered */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.98 }}
            className="group"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500/20 via-pink-400/20 to-rose-500/20 dark:from-purple-600/30 dark:via-pink-500/30 dark:to-rose-600/30 theme-pink:from-pink-500/30 theme-pink:via-rose-400/30 theme-pink:to-fuchsia-500/30 h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/30 rounded-full blur-3xl"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 theme-pink:text-pink-600 mb-2">Flashcards Mastered</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                      {masteredFlashcards}/{totalFlashcards}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Tasks - Left Column */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2"
          >
            <Card className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CardTitle>Today's Tasks</CardTitle>
                  {todaysTasks.length > 0 && (
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full shadow-lg">
                      {todaysTasks.length}
                    </span>
                  )}
                  {highPriorityToday.length > 0 && (
                    <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-bold rounded-full shadow-lg animate-pulse" title={`${highPriorityToday.length} high priority task${highPriorityToday.length > 1 ? 's' : ''}`}>
                      ⚠️ {highPriorityToday.length} High Priority
                    </span>
                  )}
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <CardContent className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                {todaysTasks.length > 0 ? (
                  <div className="space-y-3">

                    {/* All Today's Tasks - No Limit */}
                    {todaysTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ 
                          delay: index * 0.05,
                          type: 'spring',
                          stiffness: 200,
                          damping: 20
                        }}
                        whileHover={{ 
                          x: 8,
                          scale: 1.02,
                          transition: { type: 'spring', stiffness: 400, damping: 17 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          transition-all duration-200
                          ${task.priority === 1 ? 'ring-2 ring-red-500/50 rounded-lg p-1' : ''}
                          ${task.dueDate < today.getTime() ? 'ring-2 ring-red-600 rounded-lg p-1 bg-red-50/50 dark:bg-red-900/20' : ''}
                        `}
                      >
                        <TaskSummary
                          task={task}
                          onComplete={() => handleCompleteTask(task.id)}
                        />
                      </motion.div>
                    ))}

                    {/* Quick Link to Calendar */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center pt-4 border-t border-gray-200 dark:border-gray-700 mt-4"
                    >
                      <Link
                        to="/calendar"
                        className="inline-flex items-center text-purple-600 dark:text-purple-400 theme-pink:text-pink-600 hover:text-purple-700 dark:hover:text-purple-300 theme-pink:hover:text-pink-700 text-sm font-semibold transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        View Full Calendar
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No tasks for today. Great job! 🎉</p>
                    <Link
                      to="/calendar"
                      className="inline-flex items-center text-purple-600 dark:text-purple-400 theme-pink:text-pink-600 hover:text-purple-700 dark:hover:text-purple-300 theme-pink:hover:text-pink-700 text-sm font-semibold transition-colors"
                    >
                      Add a task
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Link>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Study Streak - Right Column */}
          <motion.div variants={itemVariants}>
            <StudyStreakTracker
              lastStudyDate={state.user?.lastStudyDate}
              studyStreak={state.user?.studyStreak || 0}
            />
          </motion.div>
        </div>

        {/* Bottom Grid - Course Progress and Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Course Progress */}
          <motion.div variants={itemVariants}>
            <CourseProgressWidget
              courses={state.courses}
              flashcards={state.flashcards}
              tasks={state.tasks}
              limit={3}
            />
          </motion.div>

          {/* Upcoming Tasks Widget */}
          <motion.div variants={itemVariants}>
            <UpcomingTasksWidget
              tasks={state.tasks}
              courses={state.courses}
              limit={5}
              onCompleteTask={handleCompleteTask}
            />
          </motion.div>
        </div>

        {/* Recent Courses Quick Access */}
        {recentCourses.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="mt-6"
          >
            <Card>
              <CardTitle className="mb-6">Recent Courses</CardTitle>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentCourses.map((course, index) => {
                    const courseColor = `var(--course-${course.colorTheme}, #3b82f6)`;
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <Link
                          to={`/courses/${course.id}/notes`}
                          className="block p-5 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 hover:from-white dark:hover:from-gray-800 hover:to-white dark:hover:to-gray-800 backdrop-blur-sm transition-all duration-300 group"
                        >
                          <div className="flex items-center mb-3">
                            <div
                              className="w-5 h-5 rounded-full mr-3 shadow-lg"
                              style={{ backgroundColor: courseColor }}
                            />
                            <h4 className="font-bold text-gray-900 dark:text-white theme-pink:text-pink-700 group-hover:text-purple-600 dark:group-hover:text-purple-400 theme-pink:group-hover:text-pink-600 transition-colors">
                              {course.name}
                            </h4>
                          </div>
                          {course.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-500 line-clamp-2">
                              {course.description}
                            </p>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="text-center mt-6">
                  <Link
                    to="/courses"
                    className="inline-flex items-center text-purple-600 dark:text-purple-400 theme-pink:text-pink-600 hover:text-purple-700 dark:hover:text-purple-300 theme-pink:hover:text-pink-700 font-semibold transition-colors"
                  >
                    View all courses
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
