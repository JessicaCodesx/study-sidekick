import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card, { CardTitle, CardContent } from '../common/Card';
import { Course, Flashcard, Task } from '../../lib/types';

interface CourseProgressWidgetProps {
  courses: Course[];
  flashcards: Flashcard[];
  tasks: Task[];
  limit?: number;
}

interface CourseProgressData {
  courseId: string;
  courseName: string;
  colorTheme: string;
  totalFlashcards: number;
  masteredFlashcards: number;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

const CourseProgressWidget = ({
  courses,
  flashcards,
  tasks,
  limit = 3
}: CourseProgressWidgetProps) => {
  const [progressData, setProgressData] = useState<CourseProgressData[]>([]);
  
  // Calculate progress data for each active course
  useEffect(() => {
    const activeCourses = courses.filter(course => !course.isArchived);
    
    const progress = activeCourses.map(course => {
      // Get flashcards for this course
      const courseFlashcards = flashcards.filter(fc => fc.courseId === course.id);
      const masteredFlashcards = courseFlashcards.filter(fc => fc.confidenceLevel >= 4);
      
      // Get tasks for this course
      const courseTasks = tasks.filter(task => task.courseId === course.id);
      const completedTasks = courseTasks.filter(task => task.status === 'completed');
      
      // Calculate overall progress (weighted average: 60% flashcards, 40% tasks)
      const flashcardProgress = courseFlashcards.length > 0 
        ? (masteredFlashcards.length / courseFlashcards.length) 
        : 0;
        
      const taskProgress = courseTasks.length > 0 
        ? (completedTasks.length / courseTasks.length) 
        : 0;
      
      // Weight the progress (adjust weights as needed)
      const overallProgress = courseFlashcards.length > 0 && courseTasks.length > 0
        ? (flashcardProgress * 0.6) + (taskProgress * 0.4)
        : courseFlashcards.length > 0
          ? flashcardProgress
          : courseTasks.length > 0
            ? taskProgress
            : 0;
      
      return {
        courseId: course.id,
        courseName: course.name,
        colorTheme: course.colorTheme,
        totalFlashcards: courseFlashcards.length,
        masteredFlashcards: masteredFlashcards.length,
        totalTasks: courseTasks.length,
        completedTasks: completedTasks.length,
        progress: overallProgress * 100 // Convert to percentage
      };
    });
    
    // Sort by progress (lowest to highest)
    const sorted = progress.sort((a, b) => a.progress - b.progress);
    
    // Take the specified number of courses
    setProgressData(sorted.slice(0, limit));
  }, [courses, flashcards, tasks, limit]);
  
  // Get appropriate background color based on the course's color theme
  const getBgColor = (colorTheme: string) => {
    return `bg-course-${colorTheme}`;
  };
  
  // Get appropriate text color based on the course's color theme
  const getTextColor = (colorTheme: string) => {
    const lightColors = ['yellow', 'lime', 'amber'];
    return lightColors.includes(colorTheme) ? 'text-gray-900' : 'text-white';
  };
  
  // Format progress percentage
  const formatProgress = (progress: number) => {
    return `${Math.round(progress)}%`;
  };
  
  // Determine progress color based on percentage
  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-red-500 dark:bg-red-600';
    if (progress < 50) return 'bg-yellow-500 dark:bg-yellow-600';
    if (progress < 75) return 'bg-blue-500 dark:bg-blue-600';
    return 'bg-green-500 dark:bg-green-600';
  };

  return (
    <Card className="h-full">
      <CardTitle>Course Progress</CardTitle>
      <CardContent>
        {progressData.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <p>No active courses found.</p>
            <Link to="/courses" className="text-purple-600 dark:text-purple-400 hover:underline mt-2 inline-block">
              Add your first course
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {progressData.map((course, index) => (
              <motion.div
                key={course.courseId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="mb-1 flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className={`w-4 h-4 rounded-full mr-2 ${getBgColor(course.colorTheme)}`}
                    ></div>
                    <Link 
                      to={`/courses/${course.courseId}/notes`}
                      className="font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      {course.courseName}
                    </Link>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatProgress(course.progress)}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                  <div 
                    className={`${getProgressColor(course.progress)} h-2.5 rounded-full`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span>
                    {course.masteredFlashcards} / {course.totalFlashcards} flashcards mastered
                  </span>
                  <span>
                    {course.completedTasks} / {course.totalTasks} tasks complete
                  </span>
                </div>
              </motion.div>
            ))}
            
            {courses.filter(c => !c.isArchived).length > limit && (
              <div className="text-center pt-2">
                <Link to="/courses" className="text-purple-600 dark:text-purple-400 hover:underline text-sm">
                  View all courses
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseProgressWidget;