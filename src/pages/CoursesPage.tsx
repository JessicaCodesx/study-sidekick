import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getAll, add, update, remove } from '../lib/db';
import { Course } from '../lib/types';
import { generateId, getCurrentTimestamp } from '../lib/utils';
import Button from '../components/common/Button';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import CourseCard from '../components/courses/CourseCard';
import CourseForm from '../components/courses/CourseForm';
import Modal from '../components/common/Modal';

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your courses and their content
          </p>
        </div>
        
        <div className="mt-3 md:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? 'Show Active Courses' : 'Show Archived Courses'}
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
        </div>
      </div>
      
      {state.loading && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading courses...</p>
        </div>
      )}
      
      {!state.loading && filteredCourses.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-4"
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
              
              {showArchived ? (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You don't have any archived courses yet.
                </p>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    You haven't added any courses yet.
                  </p>
                  <Button variant="primary" onClick={handleAddCourse}>
                    Add Your First Course
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {!state.loading && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => handleEditCourse(course)}
              onArchive={() => handleToggleArchive(course)}
              onDelete={() => handleDeleteCourse(course.id)}
            />
          ))}
        </div>
      )}
      
      {/* Add Course Modal */}
      <Modal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        title="Add New Course"
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
    </div>
  );
};

export default CoursesPage;