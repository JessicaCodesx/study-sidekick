import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card, { CardTitle, CardContent } from '../common/Card';
import { calculateStudyStreak } from '../../lib/utils';

interface StudyStreakTrackerProps {
  lastStudyDate?: number;
  studyStreak: number;
}

const StudyStreakTracker = ({ lastStudyDate, studyStreak }: StudyStreakTrackerProps) => {
  const [currentStreak, setCurrentStreak] = useState(studyStreak);
  const [streakDays, setStreakDays] = useState<boolean[]>([]);
  
  // Generate the last 7 days streak status
  useEffect(() => {
    const days = [];
    const today = new Date();
    
    // For demonstration, we'll create a visual representation of the last 7 days
    // where true = studied that day, false = didn't study
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // This is simplified logic - in a real app, you would check if 
      // the user studied on each of these days
      const didStudy = i % 2 === 0 || i === 0; // Just a pattern for demonstration
      days.push(didStudy);
    }
    
    setStreakDays(days);
    
    // Calculate actual streak if lastStudyDate is provided
    if (lastStudyDate) {
      const calculatedStreak = calculateStudyStreak(lastStudyDate);
      setCurrentStreak(calculatedStreak);
    }
  }, [lastStudyDate, studyStreak]);
  
  return (
    <Card className="h-full">
      <CardTitle>Study Streak</CardTitle>
      <CardContent>
        <div className="text-center py-3">
          <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-3">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </div>
          
          <div className="flex justify-center items-center space-x-1 my-4">
            {streakDays.map((studied, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    studied 
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {studied ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  {getDayLabel(index)}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getStreakMessage(currentStreak)}
            </p>
            
            {currentStreak === 0 && lastStudyDate && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Last studied: {formatDate(lastStudyDate)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get day label (e.g., "M", "T", etc.)
const getDayLabel = (index: number): string => {
  const today = new Date();
  const date = new Date();
  date.setDate(today.getDate() - (6 - index));
  
  // If it's today or yesterday, return that instead of the day letter
  if (index === 6) return 'Today';
  if (index === 5) return 'Yest';
  
  // Otherwise return the first letter of the day name
  return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
};

// Helper function to format date
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to get motivational message based on streak
const getStreakMessage = (streak: number): string => {
  if (streak === 0) {
    return "Let's start your study streak today!";
  } else if (streak === 1) {
    return "You're on your way! First day complete.";
  } else if (streak < 5) {
    return "Keep it going! You're building momentum.";
  } else if (streak < 10) {
    return "Impressive streak! You're developing great habits.";
  } else {
    return "Outstanding! Your dedication is paying off.";
  }
};

export default StudyStreakTracker;