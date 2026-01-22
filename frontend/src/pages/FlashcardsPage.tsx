// FlashcardsPage.tsx - Web version with flashcard management
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { Flashcard, Course } from '../lib/types';
import { add, update, remove } from '../lib/db';
import { generateId, getCurrentTimestamp } from '../lib/utils';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import FlashcardEditor from '../components/flashcards/FlashcardEditor';
import FlashcardViewer from '../components/flashcards/FlashcardViewer';
import SpacedRepetitionStudy from '../components/flashcards/SpacedRepetitionStudy';

const FlashcardsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { state, dispatch } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  const course = state.courses.find(c => c.id === courseId);
  const courseUnits = state.units.filter(u => u.courseId === courseId);
  const courseFlashcards = state.flashcards.filter(f => f.courseId === courseId);

  const handleAddFlashcard = (unitId: string) => {
    setEditingFlashcard(null);
    setSelectedUnit(unitId);
    setShowModal(true);
  };

  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setSelectedUnit(flashcard.unitId);
    setShowModal(true);
  };

  const handleSaveFlashcard = async (flashcardData: { question: string; answer: string; unitId: string; tags?: string }) => {
    try {
      const now = getCurrentTimestamp();
      
      if (editingFlashcard) {
        const updatedFlashcard: Flashcard = {
          ...editingFlashcard,
          question: flashcardData.question,
          answer: flashcardData.answer,
          unitId: flashcardData.unitId,
          tags: flashcardData.tags,
          updatedAt: now,
        };
        await update('flashcards', updatedFlashcard);
        dispatch({ type: 'UPDATE_FLASHCARD', payload: updatedFlashcard });
      } else {
        const newFlashcard: Flashcard = {
          id: generateId(),
          question: flashcardData.question,
          answer: flashcardData.answer,
          courseId: courseId!,
          unitId: flashcardData.unitId,
          tags: flashcardData.tags,
          reviewCount: 0,
          confidenceLevel: 1,
          createdAt: now,
          updatedAt: now,
        };
        await add('flashcards', newFlashcard);
        dispatch({ type: 'ADD_FLASHCARD', payload: newFlashcard });
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving flashcard:', error);
      alert('Failed to save flashcard');
    }
  };

  const handleDeleteFlashcard = async (flashcard: Flashcard) => {
    if (confirm('Are you sure you want to delete this flashcard?')) {
      try {
        await remove('flashcards', flashcard.id);
        dispatch({ type: 'DELETE_FLASHCARD', payload: flashcard.id });
      } catch (error) {
        console.error('Error deleting flashcard:', error);
        alert('Failed to delete flashcard');
      }
    }
  };

  if (!course) {
    return (
      <div className="flashcards-container p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">Course not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showStudyMode && courseFlashcards.length > 0) {
    return (
      <SpacedRepetitionStudy
        flashcards={courseFlashcards}
        onBack={() => setShowStudyMode(false)}
      />
    );
  }

  return (
    <div className="flashcards-container p-6 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">
              <span className="gradient-text">{course.name} - Flashcards</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Create and study flashcards with spaced repetition
            </p>
          </div>
          {courseFlashcards.length > 0 && (
            <Button
              variant="primary"
              onClick={() => setShowStudyMode(true)}
            >
              🎓 Start Studying
            </Button>
          )}
        </div>

        {/* Flashcards by Unit */}
        {courseUnits.length > 0 ? (
          <div className="space-y-6">
            {courseUnits.map((unit, index) => {
              const unitFlashcards = courseFlashcards.filter(f => f.unitId === unit.id);
              return (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <CardTitle>{unit.name}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddFlashcard(unit.id)}
                        >
                          + Add Flashcard
                        </Button>
                      </div>
                      {unitFlashcards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {unitFlashcards.map((flashcard) => (
                            <FlashcardViewer
                              key={flashcard.id}
                              flashcard={flashcard}
                              onEdit={() => handleEditFlashcard(flashcard)}
                              onDelete={() => handleDeleteFlashcard(flashcard)}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          No flashcards in this unit yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
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
                Create units in the course settings to organize your flashcards
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {courseFlashcards.length === 0 && courseUnits.length > 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No flashcards yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Create flashcards to start studying
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Flashcard Editor Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
      >
        <FlashcardEditor
          flashcard={editingFlashcard}
          courseId={courseId!}
          unitId={selectedUnit}
          units={courseUnits}
          onSave={handleSaveFlashcard}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default FlashcardsPage;
