import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card, { CardContent } from '../common/Card';
import { Course } from '../../lib/types';
import { truncateText } from '../../lib/utils';

interface CourseCardProps {
  course: Course;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const CourseCard = ({ course, onEdit, onArchive, onDelete }: CourseCardProps) => {
  // Get appropriate background and text color classes based on the course's color theme
  const getColorClasses = (colorTheme: string) => {
    // If it's a color name from our predefined list, construct the classes
    const colorNames = [
      'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 
      'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
    ];
    
    if (colorNames.includes(colorTheme)) {
      const bgClass = `bg-course-${colorTheme}`;
      const textClass = ['yellow', 'lime', 'amber'].includes(colorTheme) ? 'text-gray-900' : 'text-white';
      return `${bgClass} ${textClass}`;
    }
    
    // Default fallback
    return 'bg-primary-600 text-white';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="hover" className="h-full">
        <CardContent>
          <div className="flex items-start">
            <div 
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${getColorClasses(course.colorTheme)}`}
            >
              {course.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="ml-4 flex-1">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {course.name}
              </h3>
              
              {course.instructor && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Instructor: {course.instructor}
                </p>
              )}
              
              {course.schedule && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Schedule: {course.schedule}
                </p>
              )}
              
              {course.location && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Location: {course.location}
                </p>
              )}
            </div>
          </div>
          
          {course.description && (
            <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm">
              {truncateText(course.description, 150)}
            </p>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/courses/${course.id}/notes`}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 dark:text-primary-200 bg-primary-50 dark:bg-primary-900 hover:bg-primary-100 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Notes
              </Link>
              
              <Link
                to={`/courses/${course.id}/flashcards`}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-secondary-700 dark:text-secondary-200 bg-secondary-50 dark:bg-secondary-900 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                Flashcards
              </Link>
              
              <Link
                to={`/calendar?course=${course.id}`}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 dark:text-green-200 bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Tasks
              </Link>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Edit course"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            
            <button
              onClick={onArchive}
              className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label={course.isArchived ? "Unarchive course" : "Archive course"}
            >
              {course.isArchived ? (
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
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              ) : (
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
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              )}
            </button>
            
            <button
              onClick={onDelete}
              className="p-1.5 rounded-full text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Delete course"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCard;