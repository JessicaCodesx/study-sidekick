// NotesPage.tsx - Web version with note management
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { Note, Course } from '../lib/types';
import { add, update, remove, getAll } from '../lib/db';
import { generateId, getCurrentTimestamp, formatDate } from '../lib/utils';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import NoteEditor from '../components/notes/NoteEditor';
import UnitAccordion from '../components/notes/UnitAccordion';

const NotesPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { state, dispatch } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  const course = state.courses.find(c => c.id === courseId);
  const courseUnits = state.units.filter(u => u.courseId === courseId);
  const courseNotes = state.notes.filter(n => n.courseId === courseId);

  const handleAddNote = (unitId: string) => {
    setEditingNote(null);
    setSelectedUnit(unitId);
    setShowModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setSelectedUnit(note.unitId);
    setShowModal(true);
  };

  const handleSaveNote = async (noteData: { title: string; content: string; unitId: string }) => {
    try {
      const now = getCurrentTimestamp();
      
      if (editingNote) {
        const updatedNote: Note = {
          ...editingNote,
          title: noteData.title,
          content: noteData.content,
          unitId: noteData.unitId,
          updatedAt: now,
        };
        await update('notes', updatedNote);
        dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
      } else {
        const newNote: Note = {
          id: generateId(),
          title: noteData.title,
          content: noteData.content,
          courseId: courseId!,
          unitId: noteData.unitId,
          createdAt: now,
          updatedAt: now,
        };
        await add('notes', newNote);
        dispatch({ type: 'ADD_NOTE', payload: newNote });
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  };

  const handleDeleteNote = async (note: Note) => {
    if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
      try {
        await remove('notes', note.id);
        dispatch({ type: 'DELETE_NOTE', payload: note.id });
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note');
      }
    }
  };

  if (!course) {
    return (
      <div className="notes-container p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">Course not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="notes-container p-6 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-2">
            <span className="gradient-text">{course.name} - Notes</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Organize your notes by units and modules
          </p>
        </div>

        {/* Units with Notes */}
        {courseUnits.length > 0 ? (
          <div className="space-y-6">
            {courseUnits.map((unit, index) => {
              const unitNotes = courseNotes.filter(n => n.unitId === unit.id);
              return (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <UnitAccordion
                    unit={unit}
                    notes={unitNotes}
                    onAddNote={() => handleAddNote(unit.id)}
                    onEditNote={handleEditNote}
                    onDeleteNote={handleDeleteNote}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No units yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Create units in the course settings to organize your notes
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notes without units */}
        {courseNotes.filter(n => !n.unitId || !courseUnits.find(u => u.id === n.unitId)).length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Other Notes</h2>
            <div className="space-y-4">
              {courseNotes
                .filter(n => !n.unitId || !courseUnits.find(u => u.id === n.unitId))
                .map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                              {note.content || 'No content'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              Updated: {formatDate(note.updatedAt)}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditNote(note)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteNote(note)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {courseNotes.length === 0 && courseUnits.length > 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No notes yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Click "Add Note" on a unit to get started
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Note Editor Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
      >
        <NoteEditor
          note={editingNote}
          courseId={courseId!}
          unitId={selectedUnit}
          units={courseUnits}
          onSave={handleSaveNote}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default NotesPage;
