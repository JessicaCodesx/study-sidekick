// System-generated and user metadata
export interface BaseEntity {
  id: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  userId?: string; // associates with Firebase user 
}

// Course related types
export interface Course extends BaseEntity {
  name: string;
  colorTheme: string; // CSS color class or hex value
  description?: string;
  instructor?: string;
  schedule?: string;
  location?: string;
  isArchived: boolean;  
  totalWeight?: number;
  currentGrade?: number; // Current calculated grade percentage
}

// Unit/Module within a course
export interface Unit extends BaseEntity {
  courseId: string;
  name: string;
  orderIndex: number;
  description?: string;
}

// Note within a unit
export interface Note extends BaseEntity {
  courseId: string;
  unitId: string;
  title: string;
  content: string; // Markdown content
  tags?: string[];
}

// Flashcard for studying
export interface Flashcard extends BaseEntity {
  courseId: string;
  unitId: string;
  question: string;
  answer: string;
  tags?: string[];
  lastReviewed?: number; // timestamp
  reviewCount: number;
  confidenceLevel: number; // 1-5 scale
}

// Task or due date
export type TaskType = 'assignment' | 'exam' | 'quiz' | 'project' | 'reading' | 'other';
export type TaskStatus = 'pending' | 'completed' | 'overdue';

export interface Task extends BaseEntity {
  courseId?: string;
  title: string;
  description?: string;
  dueDate: number; // timestamp
  type: TaskType;
  status: TaskStatus;
  priority: number; // 1-3, with 1 being highest
  reminder?: number; // timestamp for when to remind
  weight?: number; // Percentage weight of the task (0-100)
  grade?: number; // Percentage grade received (0-100)
}

// Academic record (past course)
export interface AcademicRecord extends BaseEntity {
  name: string;
  term: string;
  credits: number;
  grade: string | number; 
  gradePercentage?: number;
  letterGrade?: string;
  notes?: string;
}


// User profile and settings
export interface User {
  displayName: string;
  avatar?: string; // Base64 encoded image or URL
  theme: 'light' | 'dark' | 'system' | 'pink';
  studyStreak: number; // Days in a row
  lastStudyDate?: number; // timestamp
  userId?: string; // Add Firebase user ID field
}

// Study session tracking
export interface StudySession extends BaseEntity {
  courseId: string;
  duration: number; // in minutes
  date: number; // timestamp
  notes?: string;
}