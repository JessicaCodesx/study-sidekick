import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Unit, Note } from '../../lib/types';

interface UnitAccordionProps {
  unit: Unit;
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onEditUnit: () => void;
  onDeleteUnit: () => void;
  onAddNote: (title: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  activeNoteId?: string;
}

const UnitAccordion = ({
  unit,
  notes,
  onSelectNote,
  onEditUnit,
  onDeleteUnit,
  onAddNote,
  onDeleteNote,
  activeNoteId,
}: UnitAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  // Toggle accordion expansion
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle quick add note
  const handleQuickAddNote = () => {
    if (newNoteTitle.trim()) {
      onAddNote(newNoteTitle.trim(), '');
      setNewNoteTitle('');
      setIsAddingNote(false);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Unit Header */}
      <div 
        className="bg-gray-50 dark:bg-gray-800 p-3 flex items-center justify-between cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center">
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="mr-2 text-gray-500 dark:text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.div>
          <h3 className="font-medium text-gray-900 dark:text-white">{unit.name}</h3>
        </div>
        
        <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setIsAddingNote(true)}
            className="p-1.5 rounded-full text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Add note"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          
          <button
            onClick={onEditUnit}
            className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Edit unit"
          >
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
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          
          <button
            onClick={onDeleteUnit}
            className="p-1.5 rounded-full text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Delete unit"
          >
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Unit Description */}
      {unit.description && isExpanded && (
        <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          {unit.description}
        </div>
      )}
      
      {/* Quick Add Note */}
      <AnimatePresence>
        {isAddingNote && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="flex items-center">
              <input
                type="text"
                value={newNoteTitle}
                onChange={e => setNewNoteTitle(e.target.value)}
                placeholder="New note title..."
                className="flex-1 px-2 py-1 text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded focus:border-primary-500 focus:ring-primary-500"
                autoFocus
              />
              
              <button
                onClick={handleQuickAddNote}
                disabled={!newNoteTitle.trim()}
                className="ml-2 p-1 rounded text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNoteTitle('');
                }}
                className="ml-1 p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Notes List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-gray-200 dark:divide-gray-700"
          >
            {notes.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                No notes in this unit
              </div>
            ) : (
              notes.map(note => (
                <div
                  key={note.id}
                  className={`px-3 py-2 pl-7 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    note.id === activeNoteId
                      ? 'bg-primary-50 dark:bg-primary-900 border-l-4 border-primary-500 dark:border-primary-400'
                      : ''
                  }`}
                  onClick={() => onSelectNote(note)}
                >
                  <span className="truncate">{note.title}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="p-1 rounded-full text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none opacity-0 group-hover:opacity-100"
                    aria-label="Delete note"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnitAccordion;