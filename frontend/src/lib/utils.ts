// src/lib/utils.ts
import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function getCurrentTimestamp(): number {
  return Date.now();
}

export function getTodayStart(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

export function getTodayEnd(): number {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today.getTime();
}

export function getWeekStart(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

export function getWeekEnd(): number {
  const today = new Date();
  today.setDate(today.getDate() + 7);
  today.setHours(23, 59, 59, 999);
  return today.getTime();
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function getTasksThisWeek(tasks: any[]): any[] {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  return tasks.filter(task =>
    task.dueDate >= weekStart && task.dueDate <= weekEnd
  );
}

export function getTasksToday(tasks: any[]): any[] {
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();
  return tasks.filter(task =>
    task.dueDate >= todayStart && task.dueDate <= todayEnd
  );
}

export function calculateGPA(records: any[]): number {
  if (records.length === 0) return 0;
  
  const gradeMap: { [key: string]: number } = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  records.forEach(record => {
    const points = gradeMap[(record.letterGrade || '').toUpperCase()] || 0;
    totalPoints += points * record.credits;
    totalCredits += record.credits;
  });
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export function getDailyQuote(): { quote: string; author: string } {
  const quotes = [
    { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function calculateStudyStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  
  const sortedSessions = [...sessions].sort((a, b) => b.date - a.date);
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const session of sortedSessions) {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    const daysDiff = (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function updateTaskStatus(task: any, newStatus: string): any {
  return {
    ...task,
    status: newStatus,
    updatedAt: getCurrentTimestamp(),
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function daysUntil(timestamp: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(timestamp);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
