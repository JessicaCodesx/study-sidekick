import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getUnitsByCourse, getNotesByCourse, add, update, remove } from '../lib/db';
import { Unit, Note } from '../lib/types';
import { generateId, getCurrentTimestamp } from '../lib/utils';
import Button from '../components/common/Button';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import UnitAccordion from '../components/notes/UnitAccordion';
import NoteEditor from '../components/notes/NoteEditor';
import Modal, { ModalFooter } from '../components/common/Modal';

const NotesPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isEditUnitModalOpen, setIsEditUnitModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitDescription, setNewUnitDescription] = useState('');
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        setUnits(courseUnits.sort((a, b) => a.orderIndex - b.orderIndex));
        
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
  
  // If course doesn't exist, redirect to courses page
  useEffect(() => {
    if (!isLoading && !course) {
      navigate('/courses');
    }
  }, [course, isLoading, navigate]);
  
  // Handle adding a new unit
  const handleAddUnit = async () => {
    if (!courseId || !newUnitName.trim()) return;
    
    try {
      setIsLoading(true);
      
      const now = getCurrentTimestamp();
      const newUnit: Unit = {
        id: generateId(),
        courseId,
        name: newUnitName.trim(),
        description: newUnitDescription.trim(),
        orderIndex: units.length, // Add to the end
        createdAt: now,
        updatedAt: now,
      };
      
      await add('units', newUnit);
      setUnits([...units, newUnit]);
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
  
  // Handle editing a unit
  const handleEditUnit = async () => {
    if (!selectedUnit || !newUnitName.trim()) return;
    
    try {
      setIsLoading(true);
      
      const updatedUnit: Unit = {
        ...selectedUnit,
        name: newUnitName.trim(),
        description: newUnitDescription.trim(),
        updatedAt: getCurrentTimestamp(),
      };
      
      await update('units', updatedUnit);
      setUnits(units.map(unit => (unit.id === updatedUnit.id ? updatedUnit : unit)));
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
  
  // Handle deleting a unit
  const handleDeleteUnit = async (unitId: string) => {
    if (!window.confirm('Are you sure you want to delete this unit? This will also delete all notes in this unit.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Delete the unit
      await remove('units', unitId);
      
      // Filter out deleted unit
      setUnits(units.filter(unit => unit.id !== unitId));
      
      // Also filter out notes associated with this unit
      setNotes(notes.filter(note => note.unitId !== unitId));
      
      // If the selected note was in this unit, clear it
      if (selectedNote && selectedNote.unitId === unitId) {
        setSelectedNote(null);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error deleting unit:', err);
      setError('Failed to delete unit');
      setIsLoading(false);
    }
  };
  
  // Handle reordering units
  const handleReorderUnits = async (reorderedUnits: Unit[]) => {
    try {
      setIsLoading(true);
      
      // Update order index of all units
      const updatedUnits = reorderedUnits.map((unit, index) => ({
        ...unit,
        orderIndex: index,
        updatedAt: getCurrentTimestamp(),
      }));
      
      // Save all updated units
      for (const unit of updatedUnits) {
        await update('units', unit);
      }
      
      setUnits(updatedUnits);
      setIsLoading(false);
    } catch (err) {
      console.error('Error reordering units:', err);
      setError('Failed to reorder units');
      setIsLoading(false);
    }
  };
  
  // Handle adding a new note
  const handleAddNote = async (unitId: string, title: string, content: string) => {
    if (!courseId || !unitId || !title.trim()) return;
    
    try {
      setIsLoading(true);
      
      const now = getCurrentTimestamp();
      const newNote: Note = {
        id: generateId(),
        courseId,
        unitId,
        title: title.trim(),
        content,
        tags: [],
        createdAt: now,
        updatedAt: now,
      };
      
      await add('notes', newNote);
      setNotes([...notes, newNote]);
      setSelectedNote(newNote);
      setIsAddNoteModalOpen(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note');
      setIsLoading(false);
    }
  };
  
  // Handle updating a note
  const handleUpdateNote = async (updatedNote: Note) => {
    try {
      setIsLoading(true);
      
      const noteToUpdate = {
        ...updatedNote,
        updatedAt: getCurrentTimestamp(),
      };
      
      await update('notes', noteToUpdate);
      setNotes(notes.map(note => (note.id === noteToUpdate.id ? noteToUpdate : note)));
      setSelectedNote(noteToUpdate);
      setIsLoading(false);
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
      setIsLoading(false);
    }
  };
  
  // Handle deleting a note
  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      await remove('notes', noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote(null);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
      setIsLoading(false);
    }
  };
  
  // If loading, show loading state
  if (isLoading && units.length === 0 && notes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading notes...</p>
        </div>
      </div>
    );
  }
  
  // If course doesn't exist, show loading or empty state
  if (!course) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 dark:text-gray-400">Course not found</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {course.name} - Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize and manage your course notes
          </p>
        </div>
        
        <div className="mt-3 md:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setNewUnitName('');
              setNewUnitDescription('');
              setIsAddUnitModalOpen(true);
            }}
          >
            Add Unit
          </Button>
          
          <Button
            variant="primary"
            onClick={() => setIsAddNoteModalOpen(true)}
            disabled={units.length === 0}
          >
            Add Note
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar: Units and notes list */}
        <div className="md:col-span-1">
          <Card>
            <CardTitle>Units</CardTitle>
            <CardContent>
              {units.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <p>No units added yet.</p>
                  <button
                    onClick={() => {
                      setNewUnitName('');
                      setNewUnitDescription('');
                      setIsAddUnitModalOpen(true);
                    }}
                    className="mt-2 text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Add your first unit
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {units.map(unit => (
                    <UnitAccordion
                      key={unit.id}
                      unit={unit}
                      notes={notes.filter(note => note.unitId === unit.id)}
                      onSelectNote={setSelectedNote}
                      onEditUnit={() => {
                        setSelectedUnit(unit);
                        setNewUnitName(unit.name);
                        setNewUnitDescription(unit.description || '');
                        setIsEditUnitModalOpen(true);
                      }}
                      onDeleteUnit={() => handleDeleteUnit(unit.id)}
                      onAddNote={(title, content) => handleAddNote(unit.id, title, content)}
                      onDeleteNote={handleDeleteNote}
                      activeNoteId={selectedNote?.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right content area: Note editor */}
        <div className="md:col-span-2">
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onUpdate={handleUpdateNote}
              onDelete={() => handleDeleteNote(selectedNote.id)}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No Note Selected
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {units.length === 0
                    ? 'Add a unit to start taking notes.'
                    : 'Select a note or create a new one to start editing.'}
                </p>
                {units.length > 0 && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsAddNoteModalOpen(true)}
                  >
                    Create New Note
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
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
            <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Note Title *
            </label>
            <input
              type="text"
              id="noteTitle"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="My New Note"
            />
          </div>
          
          <div>
            <label htmlFor="noteUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Unit *
            </label>
            <select
              id="noteUnit"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddNoteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const titleInput = document.getElementById('noteTitle') as HTMLInputElement;
              const unitSelect = document.getElementById('noteUnit') as HTMLSelectElement;
              
              if (titleInput && unitSelect && titleInput.value.trim()) {
                handleAddNote(unitSelect.value, titleInput.value, '');
              }
            }}
          >
            Create Note
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default NotesPage;