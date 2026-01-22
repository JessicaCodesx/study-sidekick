// src/lib/syncUtils.ts
import { 
    Course, 
    Unit, 
    Note, 
    Flashcard,
    Task, 
    AcademicRecord, 
    User 
  } from './types';
  import { 
    add as dbAdd, 
    update as dbUpdate, 
    remove as dbRemove 
  } from './db';
  import { 
    courseService,
    unitService,
    noteService,
    flashcardService,
    taskService,
    academicRecordService,
    userService
  } from '../services';
  
  /**
   * Syncs a course to the server or local DB based on network status
   */
  export async function syncCourse(course: Course, isOnline: boolean): Promise<Course> {
    if (isOnline) {
      // If online, sync with the server
      if (!course.id || course.id.includes('local_')) {
        // This is a new course created offline, save to server
        const newCourse = await courseService.createCourse(course);
        return newCourse;
      } else {
        // This is an existing course, update on server
        const updatedCourse = await courseService.updateCourse(course.id, course);
        return updatedCourse;
      }
    } else {
      // If offline, save to local DB
      if (!course.id) {
        // Generate a temporary local ID
        course.id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        return await dbAdd('courses', course);
      } else {
        return await dbUpdate('courses', course);
      }
    }
  }
  
  /**
   * Syncs a unit to the server or local DB based on network status
   */
  export async function syncUnit(unit: Unit, isOnline: boolean): Promise<Unit> {
    if (isOnline) {
      if (!unit.id || unit.id.includes('local_')) {
        const newUnit = await unitService.createUnit(unit);
        return newUnit;
      } else {
        const updatedUnit = await unitService.updateUnit(unit.id, unit);
        return updatedUnit;
      }
    } else {
      if (!unit.id) {
        unit.id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        return await dbAdd('units', unit);
      } else {
        return await dbUpdate('units', unit);
      }
    }
  }
  
  /**
   * Syncs a note to the server or local DB based on network status
   */
  export async function syncNote(note: Note, isOnline: boolean): Promise<Note> {
    if (isOnline) {
      if (!note.id || note.id.includes('local_')) {
        const newNote = await noteService.createNote(note);
        return newNote;
      } else {
        const updatedNote = await noteService.updateNote(note.id, note);
        return updatedNote;
      }
    } else {
      if (!note.id) {
        note.id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        return await dbAdd('notes', note);
      } else {
        return await dbUpdate('notes', note);
      }
    }
  }
  
  /**
   * Syncs a flashcard to the server or local DB based on network status
   */
  export async function syncFlashcard(flashcard: Flashcard, isOnline: boolean): Promise<Flashcard> {
    if (isOnline) {
      if (!flashcard.id || flashcard.id.includes('local_')) {
        const newFlashcard = await flashcardService.createFlashcard(flashcard);
        return newFlashcard;
      } else {
        const updatedFlashcard = await flashcardService.updateFlashcard(flashcard.id, flashcard);
        return updatedFlashcard;
      }
    } else {
      if (!flashcard.id) {
        flashcard.id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        return await dbAdd('flashcards', flashcard);
      } else {
        return await dbUpdate('flashcards', flashcard);
      }
    }
  }
  
  /**
   * Syncs a task to the server or local DB based on network status
   */
  export async function syncTask(task: Task, isOnline: boolean): Promise<Task> {
    if (isOnline) {
      if (!task.id || task.id.includes('local_')) {
        const newTask = await taskService.createTask(task);
        return newTask;
      } else {
        const updatedTask = await taskService.updateTask(task.id, task);
        return updatedTask;
      }
    } else {
      if (!task.id) {
        task.id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        return await dbAdd('tasks', task);
      } else {
        return await dbUpdate('tasks', task);
      }
    }
  }
  
  /**
   * Syncs an academic record to the server or local DB based on network status
   */
  export async function syncAcademicRecord(record: AcademicRecord, isOnline: boolean): Promise<AcademicRecord> {
    if (isOnline) {
      if (!record.id || record.id.includes('local_')) {
        const newRecord = await academicRecordService.createAcademicRecord(record);
        return newRecord;
      } else {
        const updatedRecord = await academicRecordService.updateAcademicRecord(record.id, record);
        return updatedRecord;
      }
    } else {
      if (!record.id) {
        record.id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        return await dbAdd('academicRecords', record);
      } else {
        return await dbUpdate('academicRecords', record);
      }
    }
  }
  
  /**
   * Syncs user settings to the server or local DB based on network status
   */
  export async function syncUserSettings(user: User, isOnline: boolean): Promise<User> {
    if (isOnline) {
      const updatedUser = await userService.updateUserProfile(user);
      return updatedUser;
    } else {
      return await dbUpdate('user', user);
    }
  }
  
  /**
   * Deletes an entity both locally and on the server
   */
  export async function syncDelete(storeName: string, id: string, isOnline: boolean): Promise<void> {
    // Always delete locally
    await dbRemove(storeName, id);
    
    // If online, delete on server too
    if (isOnline && !id.includes('local_')) {
      switch (storeName) {
        case 'courses':
          await courseService.deleteCourse(id);
          break;
        case 'units':
          await unitService.deleteUnit(id);
          break;
        case 'notes':
          await noteService.deleteNote(id);
          break;
        case 'flashcards':
          await flashcardService.deleteFlashcard(id);
          break;
        case 'tasks':
          await taskService.deleteTask(id);
          break;
        case 'academicRecords':
          await academicRecordService.deleteAcademicRecord(id);
          break;
      }
    }
  }