// CoursesPage.tsx - Web version with Tailwind CSS
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { Course } from '../lib/types';
import { add, update, remove } from '../lib/db';
import { getCurrentTimestamp, generateId } from '../lib/utils';
import Card from '../components/common/Card';
import CourseCard from '../components/courses/CourseCard';
import CourseForm from '../components/courses/CourseForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

const CoursesPage = () => {
  const { state, dispatch } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [filterColor, setFilterColor] = useState<string | null>(null);

  const activeCourses = state.courses.filter(c => !c.isArchived);
  const archivedCourses = state.courses.filter(c => c.isArchived);

  // Filter courses based on search and color
  const filteredActiveCourses = useMemo(() => {
    let filtered = activeCourses;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.instructor?.toLowerCase().includes(query)
      );
    }

    // Filter by color
    if (filterColor) {
      filtered = filtered.filter(course => course.colorTheme === filterColor);
    }

    return filtered;
  }, [activeCourses, searchQuery, filterColor]);

  const filteredArchivedCourses = useMemo(() => {
    if (!showArchived) return [];
    
    let filtered = archivedCourses;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.instructor?.toLowerCase().includes(query)
      );
    }

    // Filter by color
    if (filterColor) {
      filtered = filtered.filter(course => course.colorTheme === filterColor);
    }

    return filtered;
  }, [archivedCourses, showArchived, searchQuery, filterColor]);

  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleSaveCourse = async (formData: {
    name: string;
    colorTheme: string;
    description: string;
    instructor: string;
    schedule: string;
    location: string;
  }) => {
    try {
      const now = getCurrentTimestamp();

      if (editingCourse) {
        // Update existing course
        const updatedCourse: Course = {
          ...editingCourse,
          name: formData.name,
          description: formData.description,
          colorTheme: formData.colorTheme,
          instructor: formData.instructor,
          schedule: formData.schedule,
          location: formData.location,
          updatedAt: now,
        };
        await update('courses', updatedCourse);
        dispatch({ type: 'UPDATE_COURSE', payload: updatedCourse });
      } else {
        // Create new course
        const newCourse: Course = {
          id: generateId(),
          name: formData.name,
          description: formData.description,
          colorTheme: formData.colorTheme,
          instructor: formData.instructor,
          schedule: formData.schedule,
          location: formData.location,
          isArchived: false,
          createdAt: now,
          updatedAt: now,
        };
        await add('courses', newCourse);
        dispatch({ type: 'ADD_COURSE', payload: newCourse });
      }

      setShowModal(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course. Please try again.');
    }
  };

  const handleArchiveCourse = async (course: Course) => {
    try {
      const updatedCourse: Course = {
        ...course,
        isArchived: !course.isArchived,
        updatedAt: getCurrentTimestamp(),
      };
      await update('courses', updatedCourse);
      dispatch({ type: 'UPDATE_COURSE', payload: updatedCourse });
    } catch (error) {
      console.error('Error archiving course:', error);
      alert('Failed to archive course. Please try again.');
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!confirm(`Are you sure you want to delete "${course.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await remove('courses', course.id);
      dispatch({ type: 'DELETE_COURSE', payload: course.id });
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  // Get unique color themes for filter
  const availableColors = useMemo(() => {
    const colors = new Set(activeCourses.map(c => c.colorTheme));
    return Array.from(colors).sort();
  }, [activeCourses]);

  return (
    <div className="courses-container p-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        {/* Header with premium design */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-5xl font-extrabold mb-3">
                <span className="gradient-text">My Courses</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 theme-pink:text-pink-600">
                {activeCourses.length} active {activeCourses.length === 1 ? 'course' : 'courses'}
                {archivedCourses.length > 0 && (
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    • {archivedCourses.length} archived
                  </span>
                )}
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="primary"
                onClick={handleAddCourse}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Course
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Search and Filters with premium design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 border-0 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all shadow-sm focus:shadow-md"
                  />
                </div>
              </div>

              {/* Color Filter */}
              {availableColors.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Filter by color:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterColor(null)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filterColor === null
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      All
                    </button>
                    {availableColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setFilterColor(color)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          filterColor === color
                            ? 'ring-2 ring-offset-2 ring-purple-500 dark:ring-purple-400'
                            : ''
                        } bg-course-${color} ${['yellow', 'lime', 'amber'].includes(color) ? 'text-gray-900' : 'text-white'}`}
                        title={color}
                      >
                        {filterColor === color && (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Active Courses with premium grid */}
        {filteredActiveCourses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {filteredActiveCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.08,
                  type: 'spring',
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="h-full"
              >
                <CourseCard
                  course={course}
                  tasks={state.tasks}
                  onEdit={() => handleEditCourse(course)}
                  onArchive={() => handleArchiveCourse(course)}
                  onDelete={() => handleDeleteCourse(course)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="text-center py-16 border-0 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {searchQuery || filterColor ? 'No courses found' : 'No courses yet'}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || filterColor
                  ? 'Try adjusting your search or filters'
                  : 'Add your first course to get started'}
              </p>
              {!searchQuery && !filterColor && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="primary" 
                    onClick={handleAddCourse}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Add Your First Course
                  </Button>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Archived Courses */}
        {archivedCourses.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white theme-pink:text-pink-700">
                Archived Courses
              </h2>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="text-sm text-purple-600 dark:text-purple-400 theme-pink:text-pink-600 hover:underline"
              >
                {showArchived ? 'Hide' : 'Show'} ({archivedCourses.length})
              </button>
            </div>

            {showArchived && filteredArchivedCourses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArchivedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    tasks={state.tasks}
                    onEdit={() => handleEditCourse(course)}
                    onArchive={() => handleArchiveCourse(course)}
                    onDelete={() => handleDeleteCourse(course)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Course Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingCourse(null);
          }}
          title={editingCourse ? 'Edit Course' : 'New Course'}
          size="lg"
        >
          <CourseForm
            initialData={
              editingCourse
                ? {
                    name: editingCourse.name,
                    colorTheme: editingCourse.colorTheme,
                    description: editingCourse.description || '',
                    instructor: editingCourse.instructor || '',
                    schedule: editingCourse.schedule || '',
                    location: editingCourse.location || '',
                  }
                : undefined
            }
            onSubmit={handleSaveCourse}
            onCancel={() => {
              setShowModal(false);
              setEditingCourse(null);
            }}
          />
        </Modal>
      </div>
    </div>
  );
};

export default CoursesPage;
