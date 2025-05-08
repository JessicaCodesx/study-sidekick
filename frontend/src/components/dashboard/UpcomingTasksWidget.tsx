import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card, { CardTitle, CardContent } from '../common/Card';
import Button from '../common/Button';
import { Task, Course } from '../../lib/types';
import { daysUntil, formatDate } from '../../lib/utils';

interface UpcomingTasksWidgetProps {
  tasks: Task[];
  courses: Course[];
  limit?: number;
  onCompleteTask: (taskId: string) => void;
}

const UpcomingTasksWidget = ({ 
  tasks,
  courses,
  limit = 5,
  onCompleteTask
}: UpcomingTasksWidgetProps) => {
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  
  // Filter and sort tasks that are due in the next 7 days
  useEffect(() => {
    // First filter out completed tasks and tasks due more than 7 days from now
    const filtered = tasks.filter(task => {
      if (task.status === 'completed') return false;
      
      const days = daysUntil(task.dueDate);
      return days <= 7 && days >= -1; // Include tasks due today and yesterday (overdue)
    });
    
    // Then sort by due date
    const sorted = [...filtered].sort((a, b) => a.dueDate - b.dueDate);
    
    // Limit the number of tasks shown
    setUpcomingTasks(sorted.slice(0, limit));
  }, [tasks, limit]);
  
  // Find course name from course ID
  const getCourseName = (courseId?: string) => {
    if (!courseId) return null;
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : null;
  };
  
  // Get task priority tag
  const getPriorityTag = (priority: number) => {
    switch (priority) {
      case 1:
        return <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs px-2 py-0.5 rounded-full">High</span>;
      case 2:
        return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs px-2 py-0.5 rounded-full">Medium</span>;
      case 3:
        return <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-0.5 rounded-full">Low</span>;
      default:
        return null;
    }
  };
  
  // Format how soon the task is due
  const formatDueTime = (dueDate: number) => {
    const days = daysUntil(dueDate);
    
    if (days < 0) {
      return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} overdue`;
    } else if (days === 0) {
      return 'Due today';
    } else if (days === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${days} days`;
    }
  };
  
  // Get task status color
  const getTaskStatusColor = (dueDate: number) => {
    const days = daysUntil(dueDate);
    
    if (days < 0) {
      return 'text-red-600 dark:text-red-400';
    } else if (days <= 1) {
      return 'text-orange-600 dark:text-orange-400';
    } else {
      return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <Card className="h-full">
      <CardTitle>Upcoming Tasks</CardTitle>
      <CardContent>
        {upcomingTasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>No upcoming tasks due in the next 7 days.</p>
            <Link to="/calendar" className="text-purple-600 dark:text-purple-400 hover:underline mt-2 inline-block">
              Add a task
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-start">
                  <div 
                    className="mr-3 mt-0.5 h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-green-500 dark:hover:border-green-400"
                    onClick={() => onCompleteTask(task.id)}
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </h4>
                      {getPriorityTag(task.priority)}
                    </div>
                    
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm">
                      <span className={`${getTaskStatusColor(task.dueDate)}`}>
                        {formatDueTime(task.dueDate)}
                      </span>
                      
                      {task.courseId && (
                        <span className="text-gray-600 dark:text-gray-400">
                          {getCourseName(task.courseId)}
                        </span>
                      )}
                      
                      <span className="capitalize text-gray-500 dark:text-gray-500">
                        {task.type}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {tasks.length > limit && (
              <div className="text-center pt-2">
                <Link to="/calendar">
                  <Button variant="outline" size="sm">
                    View All Tasks
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingTasksWidget;