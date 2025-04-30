import { Link } from 'react-router-dom';
import Card, { CardContent } from '../common/Card';
import { Course, Task } from '../../lib/types';
import { truncateText } from '../../lib/utils';
import { formatPercentage, percentageToLetterGrade, getGradeColor } from '../../lib/gradeUtils';

interface CourseCardProps {
  course: Course;
  tasks: Task[]; // Add tasks to calculate current grade
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const CourseCard = ({ course, tasks, onEdit, onArchive, onDelete }: CourseCardProps) => {
  // Calculate current grade for this course
  const courseTasks = tasks.filter(task => task.courseId === course.id);
  const { percentage, letterGrade } = calculateCurrentGrade(courseTasks);
  
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
    return 'bg-amber-600 text-white';
  };

  // Helper function to calculate current grade
  function calculateCurrentGrade(tasks: Task[]): { percentage: number | undefined; letterGrade: string | undefined } {
    // Filter tasks that have grades and weights
    const gradedTasks = tasks.filter(task => 
      task.status === 'completed' && 
      task.grade !== undefined && 
      task.weight !== undefined
    );
    
    if (gradedTasks.length === 0) {
      return { percentage: undefined, letterGrade: undefined };
    }
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    gradedTasks.forEach(task => {
      totalWeight += task.weight!;
      weightedSum += (task.grade! * task.weight!) / 100;
    });
    
    if (totalWeight === 0) {
      return { percentage: undefined, letterGrade: undefined };
    }
    
    const percentage = (weightedSum / totalWeight) * 100;
    const letterGrade = percentageToLetterGrade(percentage);
    
    return { percentage, letterGrade };
  }

  // Get count of tasks and incomplete tasks
  const totalTasks = courseTasks.length;
  const incompleteTasks = courseTasks.filter(task => task.status !== 'completed').length;

  return (
    <Card 
      variant="hover" 
      className="h-full overflow-hidden border border-gray-100 dark:border-gray-700 theme-pink:border-pink-200 shadow-md hover:shadow-lg transition-all duration-300"
    >
      <div className={`h-2 w-full ${getColorClasses(course.colorTheme)}`}></div>
      <CardContent className="p-6">
        <div className="flex items-start">
          <div 
            className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold ${getColorClasses(course.colorTheme)} shadow-sm`}
          >
            {course.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="ml-4 flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white theme-pink:text-pink-700">
              {course.name}
            </h3>
            
            {course.instructor && (
              <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {course.instructor}
              </div>
            )}
            
            {course.schedule && (
              <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {course.schedule}
              </div>
            )}
            
            {course.location && (
              <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {course.location}
              </div>
            )}
          </div>
        </div>
        
        {/* Current Grade and Tasks Status */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {/* Current Grade */}
          <div className="bg-gray-50 dark:bg-gray-800 theme-pink:bg-pink-50 p-3 rounded-lg">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-400 uppercase tracking-wide mb-1">Current Grade</h4>
            {percentage !== undefined ? (
              <div className="flex items-center">
                <span className="font-bold text-lg text-gray-900 dark:text-white theme-pink:text-pink-700">{formatPercentage(percentage)}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(letterGrade)}`}>
                  {letterGrade}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-pink-400">No grades yet</span>
            )}
          </div>
          
          {/* Tasks Status */}
          <div className="bg-gray-50 dark:bg-gray-800 theme-pink:bg-pink-50 p-3 rounded-lg">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-400 uppercase tracking-wide mb-1">Tasks</h4>
            {totalTasks > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-600">{totalTasks - incompleteTasks}/{totalTasks} completed</span>
                {incompleteTasks > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 theme-pink:bg-pink-100 theme-pink:text-pink-700 text-xs rounded-full font-medium">
                    {incompleteTasks} due
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-pink-400">No tasks yet</span>
            )}
          </div>
        </div>
        
        {/* Description (if available) */}
        {course.description && (
          <div className="mt-4">
            <p className="text-gray-700 dark:text-gray-300 theme-pink:text-pink-600 text-sm">
              {truncateText(course.description, 150)}
            </p>
          </div>
        )}
        
        {/* Quick Navigation Links */}
        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 theme-pink:border-pink-200">
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/courses/${course.id}/notes`}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-200 theme-pink:bg-pink-50 theme-pink:text-pink-700 hover:bg-amber-100 dark:hover:bg-amber-800 theme-pink:hover:bg-pink-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
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
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 theme-pink:bg-purple-50 theme-pink:text-purple-700 hover:bg-blue-100 dark:hover:bg-blue-800 theme-pink:hover:bg-purple-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
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
            
            {/* Grades Link */}
            <Link
              to={`/courses/${course.id}/grades`}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200 theme-pink:bg-teal-50 theme-pink:text-teal-700 hover:bg-green-100 dark:hover:bg-green-800 theme-pink:hover:bg-teal-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Grades
            </Link>
            
            <Link
              to={`/calendar?course=${course.id}`}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200 theme-pink:bg-rose-50 theme-pink:text-rose-700 hover:bg-purple-100 dark:hover:bg-purple-800 theme-pink:hover:bg-rose-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
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
        
        {/* Card Actions */}
        <div className="mt-5 flex justify-end space-x-2">
          <button
            onClick={onEdit}
            className="p-2 rounded-full text-gray-500 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-400 theme-pink:hover:text-pink-700 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50 focus:outline-none transition-colors"
            aria-label="Edit course"
            title="Edit course"
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
            className="p-2 rounded-full text-gray-500 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-400 theme-pink:hover:text-pink-700 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50 focus:outline-none transition-colors"
            aria-label={course.isArchived ? "Unarchive course" : "Archive course"}
            title={course.isArchived ? "Unarchive course" : "Archive course"}
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
            className="p-2 rounded-full text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 theme-pink:hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50 focus:outline-none transition-colors"
            aria-label="Delete course"
            title="Delete course"
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
  );
};

export default CourseCard;