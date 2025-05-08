import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '../../lib/types';
import { formatDate, daysUntil } from '../../lib/utils';
import { useAppContext } from '../../context/AppContext';
import { formatPercentage, percentageToLetterGrade, getGradeColor } from '../../lib/gradeUtils';

interface TaskSummaryProps {
  task: Task;
  onComplete: () => void;
}

const TaskSummary = ({ task, onComplete }: TaskSummaryProps) => {
  const { state } = useAppContext();
  const [isHovered, setIsHovered] = useState(false);
  
  // Find associated course if it exists
  const course = task.courseId
    ? state.courses.find(c => c.id === task.courseId)
    : undefined;
  
  // Get appropriate status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };
  
  // Get appropriate priority indicator
  const getPriorityIndicator = (priority: number) => {
    switch (priority) {
      case 1: // High priority
        return (
          <span className="text-red-600 dark:text-red-400 flex items-center" title="High Priority">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </span>
        );
      case 2: // Medium priority
        return (
          <span className="text-yellow-600 dark:text-yellow-400 flex items-center" title="Medium Priority">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
          </span>
        );
      case 3: // Low priority
        return (
          <span className="text-green-600 dark:text-green-400 flex items-center" title="Low Priority">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };
  
  // Format due date with days remaining
  const formatDueDate = (dueDate: number) => {
    const days = daysUntil(dueDate);
    let dueText = formatDate(dueDate);
    
    if (days === 0) {
      dueText += ' (Today)';
    } else if (days === 1) {
      dueText += ' (Tomorrow)';
    } else if (days > 0) {
      dueText += ` (${days} days)`;
    } else if (days === -1) {
      dueText += ' (Yesterday)';
    } else {
      dueText += ` (${Math.abs(days)} days ago)`;
    }
    
    return dueText;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`p-3 border rounded-lg transition-colors ${
        task.status === 'completed'
          ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          : isHovered
          ? 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start">
        {task.status !== 'completed' ? (
          <button
            onClick={onComplete}
            className="mt-0.5 mr-3 h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 hover:border-primary-500 dark:hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Mark as complete"
          ></button>
        ) : (
          <div className="mt-0.5 mr-3 h-5 w-5 rounded-full bg-green-500 dark:bg-green-600 flex-shrink-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h4
              className={`font-medium ${
                task.status === 'completed'
                  ? 'text-gray-500 dark:text-gray-400 line-through'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {task.title}
              {task.weight !== undefined && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  ({task.weight}% of grade)
                </span>
              )}
            </h4>
            <div className="ml-2 flex items-center">{getPriorityIndicator(task.priority)}</div>
          </div>
          
          <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-3">
            {/* Task type badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getStatusColor(
                task.status
              )}`}
            >
              {task.type}
            </span>
            
            {/* Course badge if exists */}
            {course && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-course-${
                  course.colorTheme
                } ${
                  ['yellow', 'lime', 'amber'].includes(course.colorTheme)
                    ? 'text-gray-900'
                    : 'text-white'
                }`}
              >
                {course.name}
              </span>
            )}
            
            {/* Due date */}
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mr-1 ${
                  task.status === 'overdue' ? 'text-red-500 dark:text-red-400' : ''
                }`}
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
              <span className={task.status === 'overdue' ? 'text-red-500 dark:text-red-400' : ''}>
                {formatDueDate(task.dueDate)}
              </span>
            </span>
          </div>
          
          {/* Display grade if available */}
          {task.status === 'completed' && task.grade !== undefined && (
            <div className="mt-1 flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400 mr-2">Grade:</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{formatPercentage(task.grade)}</span>
              <span className={`ml-1 text-xs font-medium ${getGradeColor(percentageToLetterGrade(task.grade))}`}>
                ({percentageToLetterGrade(task.grade)})
              </span>
            </div>
          )}
          
          {task.description && (
            <p
              className={`mt-1 text-sm ${
                task.status === 'completed'
                  ? 'text-gray-400 dark:text-gray-500'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {task.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskSummary;