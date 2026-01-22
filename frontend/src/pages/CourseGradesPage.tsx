// CourseGradesPage.tsx - Web version
import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import Card, { CardTitle, CardContent } from '../components/common/Card';

const CourseGradesPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { state } = useAppContext();
  
  const course = state.courses.find(c => c.id === courseId);
  const courseTasks = state.tasks.filter(t => t.courseId === courseId && t.status === 'completed' && t.grade !== undefined);

  if (!course) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">Course not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateCourseGrade = () => {
    if (courseTasks.length === 0) return null;
    
    let totalWeighted = 0;
    let totalWeight = 0;
    
    courseTasks.forEach(task => {
      if (task.grade !== undefined && task.weight !== undefined) {
        totalWeighted += task.grade * task.weight;
        totalWeight += task.weight;
      }
    });
    
    if (totalWeight === 0) return null;
    return (totalWeighted / totalWeight).toFixed(1);
  };

  const currentGrade = calculateCourseGrade();

  return (
    <div className="p-6 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-2">
            <span className="gradient-text">{course.name} - Grades</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your grades and progress
          </p>
        </div>

        {/* Current Grade */}
        {currentGrade && (
          <Card className="mb-8 bg-gradient-to-br from-purple-600 to-pink-600 border-0">
            <CardContent className="text-center py-8">
              <p className="text-sm font-semibold text-white/90 mb-2">Current Grade</p>
              <p className="text-6xl font-bold text-white">{currentGrade}%</p>
            </CardContent>
          </Card>
        )}

        {/* Graded Tasks */}
        {courseTasks.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Graded Assignments</h2>
            {courseTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {task.type} • Weight: {task.weight ? `${(task.weight * 100).toFixed(0)}%` : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {task.grade !== undefined ? `${task.grade.toFixed(1)}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No grades yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Complete tasks and add grades to see them here
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default CourseGradesPage;
