import { useState } from 'react';
import { Task, TaskType, TaskStatus } from '../../lib/types';
import Modal, { ModalFooter } from '../common/Modal';
import Button from '../common/Button';
import Card, { CardContent } from '../common/Card';
import { formatDate, formatTime } from '../../lib/utils';
import { formatPercentage, percentageToLetterGrade, getGradeColor } from '../../lib/gradeUtils';

interface TaskDetailModalProps {
  task: Task | null;
  courses: { id: string; name: string; colorTheme: string }[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskDetailModal = ({
  task,
  courses,
  isOpen,
  onClose,
  onComplete,
  onEdit,
  onDelete
}: TaskDetailModalProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  if (!task) return null;
  
  // Find course
  const course = task.courseId ? courses.find(c => c.id === task.courseId) : null;
  
  // Format due date
  const getDueDate = (dueDate: number) => {
    const date = formatDate(dueDate, 'long');
    const time = formatTime(dueDate);
    return `${date} at ${time}`;
  };
  
  // Get task type label
  const getTaskTypeLabel = (type: TaskType): string => {
    const typeLabels: Record<TaskType, string> = {
      'assignment': 'Assignment',
      'exam': 'Exam',
      'quiz': 'Quiz',
      'project': 'Project',
      'reading': 'Reading',
      'other': 'Other Task'
    };
    return typeLabels[type] || 'Task';
  };
  
  // Get task priority label
  const getTaskPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return 'High Priority';
      case 2: return 'Medium Priority';
      case 3: return 'Low Priority';
      default: return 'Medium Priority';
    }
  };
  
  // Get status class
  const getStatusClass = (status: TaskStatus): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 theme-pink:bg-green-100 theme-pink:text-green-700';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 theme-pink:bg-red-100 theme-pink:text-red-700';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 theme-pink:bg-blue-100 theme-pink:text-blue-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 theme-pink:bg-gray-100 theme-pink:text-gray-700';
    }
  };
  
  // Get course badge style
  const getCourseStyle = (colorTheme: string) => {
    const bg = `bg-course-${colorTheme}`;
    const text = ['yellow', 'lime', 'amber'].includes(colorTheme) ? 'text-gray-900' : 'text-white';
    return `${bg} ${text}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      size="lg"
    >
      <div className="space-y-4">
        {/* Task Header with status badge and due date */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white theme-pink:text-pink-700">
            {task.title}
          </h2>
          
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(task.status)}`}>
              {task.status === 'completed' ? 'Completed' : task.status === 'overdue' ? 'Overdue' : 'Pending'}
            </span>
            
            {task.type && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 theme-pink:bg-pink-100 theme-pink:text-pink-700 rounded-full text-sm font-medium">
                {getTaskTypeLabel(task.type)}
              </span>
            )}
          </div>
        </div>
        
        {/* Task Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Due Date */}
          <Card className="bg-gray-50 dark:bg-gray-800 theme-pink:bg-pink-50 border border-gray-200 dark:border-gray-700 theme-pink:border-pink-200">
            <CardContent>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wide mb-1">
                Due Date
              </h3>
              <p className="text-lg font-medium text-gray-900 dark:text-white theme-pink:text-pink-800">
                {getDueDate(task.dueDate)}
              </p>
            </CardContent>
          </Card>

          {/* Priority */}
          <Card className="bg-gray-50 dark:bg-gray-800 theme-pink:bg-pink-50 border border-gray-200 dark:border-gray-700 theme-pink:border-pink-200">
            <CardContent>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wide mb-1">
                Priority
              </h3>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  task.priority === 1 ? 'bg-red-500' : 
                  task.priority === 2 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}></div>
                <p className="text-lg font-medium text-gray-900 dark:text-white theme-pink:text-pink-800">
                  {getTaskPriorityLabel(task.priority)}
                </p>
              </div>
            </CardContent>
          </Card>
            
          {/* Course (if associated) */}
          <Card className="bg-gray-50 dark:bg-gray-800 theme-pink:bg-pink-50 border border-gray-200 dark:border-gray-700 theme-pink:border-pink-200">
            <CardContent>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wide mb-1">
                Course
              </h3>
              {course ? (
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 bg-course-${course.colorTheme}`}></div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white theme-pink:text-pink-800">
                    {course.name}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 theme-pink:text-pink-500">
                  Not associated with any course
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Grade Information (if graded task) */}
        {task.status === 'completed' && task.grade !== undefined && (
          <Card className="border border-gray-200 dark:border-gray-700 theme-pink:border-pink-200">
            <CardContent>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wide mb-2">
                Grade Information
              </h3>
              
              <div className="flex flex-wrap justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white theme-pink:text-pink-700">
                    {formatPercentage(task.grade)}
                  </div>
                  <div className={`text-lg font-medium ${getGradeColor(percentageToLetterGrade(task.grade))}`}>
                    {percentageToLetterGrade(task.grade)}
                  </div>
                </div>
                
                {task.weight !== undefined && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-pink-500">
                      Weight
                    </div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white theme-pink:text-pink-700">
                      {task.weight}%
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Task Description */}
        {task.description && (
          <Card className="border border-gray-200 dark:border-gray-700 theme-pink:border-pink-200">
            <CardContent>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wide mb-2">
                Description
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                {task.description}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Task metadata (created/updated dates) */}
        <div className="text-xs text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 flex justify-between">
          <div>Created: {formatDate(task.createdAt)}</div>
          <div>Last updated: {formatDate(task.updatedAt)}</div>
        </div>
        
        {/* Delete Confirmation */}
        {confirmDelete ? (
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg border border-red-200 dark:border-red-800 theme-pink:bg-red-50 theme-pink:border-red-200">
            <p className="text-red-700 dark:text-red-200 theme-pink:text-red-700 mb-3">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
              >
                Delete Task
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      
      <ModalFooter>
        {task.status !== 'completed' ? (
          <Button
            variant="primary"
            onClick={() => onComplete(task.id)}
          >
            Mark as Complete
          </Button>
        ) : null}
        
        <Button
          variant="outline"
          onClick={() => onEdit(task)}
        >
          Edit Task
        </Button>
        
        {!confirmDelete ? (
          <Button
            variant="danger"
            onClick={() => setConfirmDelete(true)}
          >
            Delete Task
          </Button>
        ) : null}
      </ModalFooter>
    </Modal>
  );
};

export default TaskDetailModal;