import { Task, TaskStatus, AcademicRecord } from './types';

/**
 * Generate a unique ID without external dependencies
 * This is a simple replacement for UUID that doesn't require additional packages
 */
export function generateId(): string {
  // Combine timestamp with random string for uniqueness
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Get current timestamp
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * Format a date for display
 */
export function formatDate(timestamp: number, format: 'short' | 'long' = 'short'): string {
  const date = new Date(timestamp);
  
  if (format === 'short') {
    return date.toLocaleDateString();
  } else {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

/**
 * Format time for display
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate days until a timestamp
 * Returns negative number if date is in the past
 */
export function daysUntil(timestamp: number): number {
  const now = new Date();
  const target = new Date(timestamp);
  
  // Reset hours to compare just dates
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if task is due soon (within next 3 days)
 */
export function isTaskDueSoon(task: Task): boolean {
  const days = daysUntil(task.dueDate);
  return days >= 0 && days <= 3;
}

/**
 * Update task status based on due date
 * Returns the updated task if status changed otherwise returns the original task
 */
export function updateTaskStatus(task: Task): Task {
  let newStatus: TaskStatus = task.status;

  // If already completed no change needed
  if (task.status === 'completed') {
    return task;
  }

  // If due date has passed mark as overdue
  if (daysUntil(task.dueDate) < 0) {
    newStatus = 'overdue';
  } else {
    newStatus = 'pending';
  }

  // Only return a new object if status changed
  if (newStatus !== task.status) {
    return { ...task, status: newStatus };
  }
  
  return task;
}

/**
 * Calculate GPA from academic records
 */
export function calculateGPA(records: AcademicRecord[]): number {
  if (records.length === 0) return 0;

  // Define grade point values
  const gradePoints: Record<string, number> = {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'D-': 0.7,
    'F': 0.0,
  };

  let totalCredits = 0;
  let totalPoints = 0;

  for (const record of records) {
    // Skip records without grades
    if (!record.grade) continue;

    // Handle numerical grades
    let points: number;
    if (!isNaN(Number(record.grade))) {
      points = Number(record.grade);
    } else {
      // Handle letter grades
      points = gradePoints[record.grade] ?? 0;
    }

    totalPoints += points * record.credits;
    totalCredits += record.credits;
  }

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

/**
 * Sort tasks by priority and due date
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // First sort by status: pending first, then overdue, then completed
    const statusOrder: Record<TaskStatus, number> = {
      'pending': 0,
      'overdue': 1, 
      'completed': 2,
    };
    
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    // Then sort by priority (lower number = higher priority)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    
    // Finally sort by due date (earliest first)
    return a.dueDate - b.dueDate;
  });
}

/**
 * Get todays tasks
 */
export function getTodaysTasks(tasks: Task[]): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });
}

/**
 * Get this weeks tasks
 */
export function getThisWeeksTasks(tasks: Task[]): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const daysToEnd = 6 - dayOfWeek;
  endOfWeek.setDate(endOfWeek.getDate() + daysToEnd);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= endOfWeek;
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get initials from display name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Generate motivational quote 
 */
export function getDailyQuote(): { quote: string; author: string } {
  const quotes = [
    { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { quote: "Education is the passport to the future.", author: "Malcolm X" },
    { quote: "Learning is not attained by chance, it must be sought for with ardor and diligence.", author: "Abigail Adams" },
    { quote: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    { quote: "The mind is not a vessel to be filled but a fire to be ignited.", author: "Plutarch" },
    { quote: "Genius is 1% inspiration, 99% perspiration.", author: "Thomas Edison" },
    { quote: "Success consists of going from failure to failure without loss of enthusiasm.", author: "Winston Churchill" },
  ];
  
  // Use the current date to always show the same quote on the same day
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % quotes.length;
  
  return quotes[index];
}

/**
 * Check study streak
 * Returns the number of consecutive days the user has studied
 */
export function calculateStudyStreak(lastStudyDate: number | undefined): number {
  if (!lastStudyDate) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastStudy = new Date(lastStudyDate);
  lastStudy.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // If last study was today, streak continues
  if (lastStudy.getTime() === today.getTime()) {
    return 1; // Minimum 1 day streak
  }
  
  // If last study was yesterday, streak continues
  if (lastStudy.getTime() === yesterday.getTime()) {
    return 1; // Minimum 1 day streak
  }
  
  // Otherwise streak is broken
  return 0;
}

// Add to utils.ts
export function calculateCurrentGrade(tasks: Task[]): { percentage: number | undefined; letterGrade: string | undefined } {
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

export function percentageToLetterGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 77) return 'B+';
  if (percentage >= 73) return 'B';
  if (percentage >= 70) return 'B-';
  if (percentage >= 67) return 'C+';
  if (percentage >= 63) return 'C';
  if (percentage >= 60) return 'C-';
  if (percentage >= 57) return 'D+';
  if (percentage >= 53) return 'D';
  if (percentage >= 50) return 'D-';
  return 'F';
}
