import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAppContext } from '../context/AppContext';
import { getUnitsByCourse, getNotesByCourse, add, update, remove } from '../lib/db';
import { Unit, Note } from '../lib/types';
import { generateId, getCurrentTimestamp } from '../lib/utils';
import Button from '../components/common/Button';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import Modal, { ModalFooter } from '../components/common/Modal';
import PageContainer from '../components/layout/PageContainer';

const NotesPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  
  // State for units, notes, and UI
  const [units, setUnits] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeUnitId, setActiveUnitId] = useState(null);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isEditUnitModalOpen, setIsEditUnitModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitDescription, setNewUnitDescription] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'
  const [previewContent, setPreviewContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [noteTags, setNoteTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  
  // Refs
  const editorRef = useRef(null);
  
  // Find the current course
  const course = state.courses.find(c => c.id === courseId);
  
  // Load units and notes for this course
  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Load units for this course
        const courseUnits = await getUnitsByCourse(courseId);
        const sortedUnits = courseUnits.sort((a, b) => a.orderIndex - b.orderIndex);
        setUnits(sortedUnits);
        
        // Set active unit to first unit if none selected
        if (sortedUnits.length > 0 && !activeUnitId) {
          setActiveUnitId(sortedUnits[0].id);
        }
        
        // Load notes for this course
        const courseNotes = await getNotesByCourse(courseId);
        setNotes(courseNotes);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading units and notes:', err);
        setError('Failed to load course data');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [courseId]);
  
  // Editor modules and formats
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean']
    ]
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image',
    'color', 'background'
  ];
  
  // Handle selecting a note
  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setActiveUnitId(note.unitId);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTags(note.tags || []);
    setViewMode('edit');
  };
  
  // Add unit
  const handleAddUnit = async () => {
    if (!courseId || !newUnitName.trim()) return;
    
    try {
      setIsLoading(true);
      
      const now = getCurrentTimestamp();
      const newUnit = {
        id: generateId(),
        courseId,
        name: newUnitName.trim(),
        description: newUnitDescription.trim(),
        orderIndex: units.length,
        createdAt: now,
        updatedAt: now,
      };
      
      await add('units', newUnit);
      setUnits([...units, newUnit]);
      setActiveUnitId(newUnit.id);
      setNewUnitName('');
      setNewUnitDescription('');
      setIsAddUnitModalOpen(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Error adding unit:', err);
      setError('Failed to add unit');
      setIsLoading(false);
    }
  };
  
  // Edit unit
  const handleEditUnit = async () => {
    if (!selectedUnit || !newUnitName.trim()) return;
    
    try {
      setIsLoading(true);
      
      const updatedUnit = {
        ...selectedUnit,
        name: newUnitName.trim(),
        description: newUnitDescription.trim(),
        updatedAt: getCurrentTimestamp(),
      };
      
      await update('units', updatedUnit);
      setUnits(units.map(unit => unit.id === updatedUnit.id ? updatedUnit : unit));
      setNewUnitName('');
      setNewUnitDescription('');
      setSelectedUnit(null);
      setIsEditUnitModalOpen(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Error updating unit:', err);
      setError('Failed to update unit');
      setIsLoading(false);
    }
  };
  
  // Delete unit
  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('Are you sure you want to delete this unit? This will also delete all notes in this unit.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Delete the unit
      await remove('units', unitId);
      
      // Filter out deleted unit
      const updatedUnits = units.filter(unit => unit.id !== unitId);
      setUnits(updatedUnits);
      
      // Set active unit to first unit or null
      if (updatedUnits.length > 0) {
        setActiveUnitId(updatedUnits[0].id);
      } else {
        setActiveUnitId(null);
      }
      
      // Filter out notes in this unit
      const updatedNotes = notes.filter(note => note.unitId !== unitId);
      setNotes(updatedNotes);
      
      // If selected note was in this unit, clear it
      if (selectedNote && selectedNote.unitId === unitId) {
        setSelectedNote(null);
        setNoteTitle('');
        setNoteContent('');
        setNoteTags([]);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error deleting unit:', err);
      setError('Failed to delete unit');
      setIsLoading(false);
    }
  };
  
  // Add note
  const handleAddNote = async () => {
    if (!activeUnitId || !noteTitle.trim()) {
      setError('Please select a unit and enter a title for your note');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const now = getCurrentTimestamp();
      const newNote = {
        id: generateId(),
        courseId,
        unitId: activeUnitId,
        title: noteTitle.trim(),
        content: noteContent || '',
        tags: noteTags,
        createdAt: now,
        updatedAt: now,
      };
      
      await add('notes', newNote);
      setNotes([...notes, newNote]);
      setSelectedNote(newNote);
      setIsAddNoteModalOpen(false);
      setIsSaving(false);
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note');
      setIsSaving(false);
    }
  };
  
  // Save note changes
  const handleSaveNote = async () => {
    if (!selectedNote) return;
    
    try {
      setIsSaving(true);
      
      const updatedNote = {
        ...selectedNote,
        title: noteTitle.trim(),
        content: noteContent,
        tags: noteTags,
        updatedAt: getCurrentTimestamp(),
      };
      
      await update('notes', updatedNote);
      setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
      setSelectedNote(updatedNote);
      setIsSaving(false);
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
      setIsSaving(false);
    }
  };
  
  // Delete note
  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      await remove('notes', selectedNote.id);
      setNotes(notes.filter(note => note.id !== selectedNote.id));
      setSelectedNote(null);
      setNoteTitle('');
      setNoteContent('');
      setNoteTags([]);
      setIsLoading(false);
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
      setIsLoading(false);
    }
  };
  
  // Add tag to note
  const handleAddTag = () => {
    if (!newTag.trim() || noteTags.includes(newTag.trim())) return;
    
    setNoteTags([...noteTags, newTag.trim()]);
    setNewTag('');
  };
  
  // Remove tag from note
  const handleRemoveTag = (tagToRemove) => {
    setNoteTags(noteTags.filter(tag => tag !== tagToRemove));
  };
  
  // Toggle view mode between edit and preview
  const handleToggleViewMode = () => {
    if (viewMode === 'edit') {
      setPreviewContent(noteContent);
      setViewMode('preview');
    } else {
      setViewMode('edit');
    }
  };
  
  // Toggle fullscreen mode
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Get filtered notes based on active unit and search term
  const getFilteredNotes = () => {
    if (!activeUnitId) return [];
    
    return notes
      .filter(note => note.unitId === activeUnitId)
      .filter(note => {
        if (!searchTerm) return true;
        
        const lowercaseSearchTerm = searchTerm.toLowerCase();
        return (
          note.title.toLowerCase().includes(lowercaseSearchTerm) ||
          note.content.toLowerCase().includes(lowercaseSearchTerm) ||
          (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowercaseSearchTerm)))
        );
      });
  };

  const filteredNotes = getFilteredNotes();
  
  // Format date for display
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  // UI Elements
  const renderEditor = () => (
    <div className={`flex flex-col h-full transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4' : ''}`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-t-lg">
        <div className="flex-1">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full px-2 py-1 text-lg font-medium bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:outline-none"
            placeholder="Note Title"
          />
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleToggleViewMode}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={viewMode === 'edit' ? 'Preview' : 'Edit'}
          >
            {viewMode === 'edit' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a2 2 0 012-2h2a1 1 0 010 2H7v2a1 1 0 01-2 0zm10 0V7a1 1 0 00-1-1h-2a1 1 0 110-2h2a2 2 0 012 2v2a1 1 0 11-2 0zM5 11v2a2 2 0 002 2h2a1 1 0 110 2H7a4 4 0 01-4-4v-2a1 1 0 112 0zm10 0v2a1 1 0 001 1h2a1 1 0 110 2h-2a2 2 0 01-2-2v-2a1 1 0 112 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <button
            onClick={handleSaveNote}
            className="p-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-3">
        {noteTags.map((tag, index) => (
          <div 
            key={index} 
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full flex items-center"
          >
            {tag}
            <button 
              className="ml-1 text-gray-500 hover:text-red-500"
              onClick={() => handleRemoveTag(tag)}
            >
              ×
            </button>
          </div>
        ))}
        
        <div className="flex items-center">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder="Add tag..."
            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-l-md focus:ring-primary-500 focus:border-primary-500 w-24"
          />
          <button
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Editor or Preview Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'edit' ? (
          <ReactQuill
            ref={editorRef}
            value={noteContent}
            onChange={setNoteContent}
            modules={modules}
            formats={formats}
            theme="snow"
            className="h-full"
            placeholder="Start typing your notes here..."
          />
        ) : (
          <div className="prose prose-lg dark:prose-invert max-w-none h-full overflow-auto p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
          </div>
        )}
      </div>
    </div>
  );
  
  const renderNotesList = () => (
    <div className="h-full flex flex-col">
      {/* Search and Add Button */}
      <div className="flex items-center mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <button
          onClick={() => {
            setNoteTitle('');
            setNoteContent('');
            setNoteTags([]);
            setSelectedNote(null);
            setIsAddNoteModalOpen(true);
          }}
          className="ml-2 p-1.5 rounded-md bg-primary-500 hover:bg-primary-600 text-white transition-colors"
          title="Add Note"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      {/* Unit Tabs */}
      <div className="mb-4 overflow-x-auto flex space-x-1 pb-2">
        {units.map(unit => (
          <button
            key={unit.id}
            onClick={() => setActiveUnitId(unit.id)}
            className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
              activeUnitId === unit.id 
                ? `bg-course-${course?.colorTheme || 'blue'} ${['yellow', 'lime', 'amber'].includes(course?.colorTheme) ? 'text-gray-900' : 'text-white'}`
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {unit.name}
          </button>
        ))}
        
        {/* Add Unit Button */}
        <button
          onClick={() => {
            setNewUnitName('');
            setNewUnitDescription('');
            setIsAddUnitModalOpen(true);
          }}
          className="px-3 py-1.5 text-sm rounded-md whitespace-nowrap bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Unit
        </button>
      </div>
      
      {/* Unit Actions */}
      {activeUnitId && (
        <div className="flex justify-between items-center mb-3 px-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {units.find(u => u.id === activeUnitId)?.name || 'Unit'}
          </h3>
          
          <div className="flex space-x-1">
            <button
              onClick={() => {
                const unit = units.find(u => u.id === activeUnitId);
                if (unit) {
                  setSelectedUnit(unit);
                  setNewUnitName(unit.name);
                  setNewUnitDescription(unit.description || '');
                  setIsEditUnitModalOpen(true);
                }
              }}
              className="p-1 rounded text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Edit Unit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            
            <button
              onClick={() => handleDeleteUnit(activeUnitId)}
              className="p-1 rounded text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Delete Unit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {activeUnitId ? (
          filteredNotes.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredNotes.map(note => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all ${
                      selectedNote?.id === note.id
                      ? `bg-course-${course?.colorTheme || 'blue'}-50 border-course-${course?.colorTheme || 'blue'}-200`
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleSelectNote(note)}
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">{note.title}</h3>
                    
                    {/* Truncated note content preview */}
                    <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2" 
                         dangerouslySetInnerHTML={{ __html: note.content.length > 150 
                           ? note.content.substring(0, 150) + '...' 
                           : note.content }}
                    />
                    
                    {/* Note metadata */}
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div>
                        Last updated: {formatDate(note.updatedAt)}
                      </div>
                      
                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                              +{note.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : searchTerm ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-2 text-gray-600 dark:text-gray-400">No notes matching "{searchTerm}"</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-2 text-primary-600 dark:text-primary-400 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="mt-2 text-gray-600 dark:text-gray-400">No notes in this unit yet</p>
              <button 
                onClick={() => {
                  setNoteTitle('');
                  setNoteContent('');
                  setNoteTags([]);
                  setSelectedNote(null);
                  setIsAddNoteModalOpen(true);
                }}
                className="mt-2 text-primary-600 dark:text-primary-400 hover:underline"
              >
                Create your first note
              </button>
            </div>
          )
        ) : (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="mt-2 text-gray-600 dark:text-gray-400">No units created yet</p>
            <button 
              onClick={() => {
                setNewUnitName('');
                setNewUnitDescription('');
                setIsAddUnitModalOpen(true);
              }}
              className="mt-2 text-primary-600 dark:text-primary-400 hover:underline"
            >
              Create your first unit
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white theme-pink:text-pink-600">
            {course ? `${course.name} - Notes` : 'Course Notes'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">
            Organize and manage your course notes
          </p>
        </div>
        
        <div className="mt-3 md:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/courses/${courseId}/flashcards`)}
          >
            View Flashcards
          </Button>
          
          <Button
            variant="primary"
            onClick={() => {
              setNoteTitle('');
              setNoteContent('');
              setNoteTags([]);
              setSelectedNote(null);
              setIsAddNoteModalOpen(true);
            }}
            disabled={units.length === 0}
          >
            Add Note
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      {isLoading && !course ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading notes...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Left sidebar: Units and notes list */}
          <div className="md:col-span-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm h-full">
            {renderNotesList()}
          </div>
          
          {/* Right content area: Note editor */}
          <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm h-full">
            {selectedNote ? (
              renderEditor()
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Note Selected</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs">
                  {units.length === 0
                    ? 'Add a unit to start taking notes.'
                    : 'Select a note from the sidebar or create a new one to start editing.'}
                </p>
                {units.length > 0 && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setNoteTitle('');
                      setNoteContent('');
                      setNoteTags([]);
                      setSelectedNote(null);
                      setIsAddNoteModalOpen(true);
                    }}
                  >
                    Create New Note
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add Unit Modal */}
      <Modal
        isOpen={isAddUnitModalOpen}
        onClose={() => setIsAddUnitModalOpen(false)}
        title="Add New Unit"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="unitName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Unit Name *
            </label>
            <input
              type="text"
              id="unitName"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Unit 1: Introduction"
            />
          </div>
          
          <div>
            <label htmlFor="unitDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (Optional)
            </label>
            <textarea
              id="unitDescription"
              value={newUnitDescription}
              onChange={(e) => setNewUnitDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Brief description of this unit"
            />
          </div>
        </div>
        
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddUnitModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddUnit}
            disabled={!newUnitName.trim()}
          >
            Add Unit
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Edit Unit Modal */}
      <Modal
        isOpen={isEditUnitModalOpen}
        onClose={() => setIsEditUnitModalOpen(false)}
        title="Edit Unit"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="editUnitName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Unit Name *
            </label>
            <input
              type="text"
              id="editUnitName"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="editUnitDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (Optional)
            </label>
            <textarea
              id="editUnitDescription"
              value={newUnitDescription}
              onChange={(e) => setNewUnitDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
        
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditUnitModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEditUnit}
            disabled={!newUnitName.trim()}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Add Note Modal */}
      <Modal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        title="Add New Note"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="newNoteTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Note Title *
            </label>
            <input
              type="text"
              id="newNoteTitle"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="My New Note"
            />
          </div>
          
          <div>
            <label htmlFor="newNoteUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Unit *
            </label>
            <select
              id="newNoteUnit"
              value={activeUnitId || ''}
              onChange={(e) => setActiveUnitId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="" disabled>Select a unit</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="newNoteTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags (Optional, comma separated)
            </label>
            <input
              type="text"
              id="newNoteTags"
              value={noteTags.join(', ')}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                setNoteTags(tags);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="important, chapter1, review"
            />
          </div>
        </div>
        
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddNoteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddNote}
            disabled={!noteTitle.trim() || !activeUnitId}
          >
            Create Note
          </Button>
        </ModalFooter>
      </Modal>
    </PageContainer>
  );
};

export default NotesPage;