import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { getAll, add, update, remove } from '../lib/db';
import { Course } from '../lib/types';
import { generateId, getCurrentTimestamp } from '../lib/utils';
import Button from '../components/common/Button';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import CourseCard from '../components/courses/CourseCard';
import CourseForm from '../components/courses/CourseForm';
import Modal from '../components/common/Modal';
import PageContainer from '../components/layout/PageContainer';

const CoursesPage = () => {
  const { state, dispatch } = useAppContext();
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Load courses if not already loaded
  useEffect(() => {
    const loadCourses = async () => {
      try {
        if (state.courses.length === 0) {
          dispatch({ type: 'SET_LOADING', payload: true });
          const courses = await getAll('courses');
          dispatch({ type: 'SET_COURSES', payload: courses });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
        
        // Also load tasks if not already loaded
        if (state.tasks.length === 0) {
          dispatch({ type: 'SET_LOADING', payload: true });
          const tasks = await getAll('tasks');
          dispatch({ type: 'SET_TASKS', payload: tasks });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load courses' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadCourses();
  }, []);

  // Filter courses based on archived status
  const filteredCourses = state.courses.filter(course => course.isArchived === showArchived);

  // Open add course modal
  const handleAddCourse = () => {
    setCurrentCourse(null);
    setIsAddCourseModalOpen(true);
  };

  // Open edit course modal
  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    setIsEditCourseModalOpen(true);
  };

  // Save new course
  const handleSaveCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const now = getCurrentTimestamp();
      const newCourse: Course = {
        id: generateId(),
        ...courseData,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      };
      
      await add('courses', newCourse);
      dispatch({ type: 'ADD_COURSE', payload: newCourse });
      setIsAddCourseModalOpen(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error adding course:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add course' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Update existing course
  const handleUpdateCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    if (!currentCourse) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedCourse: Course = {
        ...currentCourse,
        ...courseData,
        updatedAt: getCurrentTimestamp(),
      };
      
      await update('courses', updatedCourse);
      dispatch({ type: 'UPDATE_COURSE', payload: updatedCourse });
      setIsEditCourseModalOpen(false);
      setCurrentCourse(null);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error updating course:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update course' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Archive/Unarchive course
  const handleToggleArchive = async (course: Course) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedCourse: Course = {
        ...course,
        isArchived: !course.isArchived,
        updatedAt: getCurrentTimestamp(),
      };
      
      await update('courses', updatedCourse);
      dispatch({ type: 'UPDATE_COURSE', payload: updatedCourse });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error archiving/unarchiving course:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to archive/unarchive course' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This will also delete all associated notes, flashcards, and tasks.')) {
      return;
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await remove('courses', courseId);
      dispatch({ type: 'DELETE_COURSE', payload: courseId });
      
      // TODO: Delete associated notes, flashcards, tasks
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error deleting course:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete course' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <PageContainer>
      {/* Header with gradient background */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-700 theme-pink:from-pink-50 theme-pink:to-pink-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white theme-pink:text-pink-600">
              {showArchived ? 'Archived Courses' : 'My Courses'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 theme-pink:text-pink-500 mt-1">
              {showArchived 
                ? 'View and manage your archived courses' 
                : 'Manage your courses and their content'}
            </p>
          </motion.div>
          
          <motion.div 
            className="mt-3 md:mt-0 flex space-x-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              variant="outline"
              onClick={() => setShowArchived(!showArchived)}
              className="border-amber-300 dark:border-amber-700 theme-pink:border-pink-300 text-amber-700 dark:text-amber-300 theme-pink:text-pink-600"
            >
              {showArchived ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Show Active Courses
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Show Archived Courses
                </>
              )}
            </Button>
            
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
              onClick={handleAddCourse}
            >
              Add Course
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Loading State */}
      {state.loading && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">Loading courses...</p>
        </motion.div>
      )}
      
      {/* Empty State */}
      {!state.loading && filteredCourses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="text-center py-12 shadow-md border border-gray-100 dark:border-gray-700 theme-pink:border-pink-200">
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900 theme-pink:bg-pink-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-amber-500 dark:text-amber-400 theme-pink:text-pink-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                
                {showArchived ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 theme-pink:text-pink-600 mb-2">
                      No Archived Courses
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 theme-pink:text-pink-500 max-w-md mx-auto mb-6">
                      You don't have any archived courses yet. When you archive a course, it will appear here.
                    </p>
                    <Button variant="outline" onClick={() => setShowArchived(false)}>
                      View Active Courses
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 theme-pink:text-pink-600 mb-2">
                      No Courses Added Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 theme-pink:text-pink-500 max-w-md mx-auto mb-6">
                      Get started by adding your first course. You can organize your courses by color, add notes, flashcards, and track your grades.
                    </p>
                    <Button 
                      variant="primary" 
                      onClick={handleAddCourse}
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      }
                    >
                      Add Your First Course
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Course Grid with Staggered Animation */}
      {!state.loading && filteredCourses.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
        >
          {filteredCourses.map(course => (
            <motion.div key={course.id} variants={itemVariants}>
              <CourseCard
                course={course}
                tasks={state.tasks}
                onEdit={() => handleEditCourse(course)}
                onArchive={() => handleToggleArchive(course)}
                onDelete={() => handleDeleteCourse(course.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Add Course Modal */}
      <Modal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        title="Add New Course"
        size="lg"
      >
        <CourseForm 
          onSubmit={handleSaveCourse}
          onCancel={() => setIsAddCourseModalOpen(false)}
        />
      </Modal>
      
      {/* Edit Course Modal */}
      <Modal
        isOpen={isEditCourseModalOpen}
        onClose={() => setIsEditCourseModalOpen(false)}
        title="Edit Course"
        size="lg"
      >
        {currentCourse && (
          <CourseForm 
            initialData={{
              name: currentCourse.name,
              colorTheme: currentCourse.colorTheme,
              description: currentCourse.description || '',
              instructor: currentCourse.instructor || '',
              schedule: currentCourse.schedule || '',
              location: currentCourse.location || '',
            }}
            onSubmit={handleUpdateCourse}
            onCancel={() => setIsEditCourseModalOpen(false)}
          />
        )}
      </Modal>
    </PageContainer>
  );
};

export default CoursesPage;