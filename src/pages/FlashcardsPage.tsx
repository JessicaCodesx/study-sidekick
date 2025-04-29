import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getUnitsByCourse, getFlashcardsByCourse, add, update, remove } from '../lib/db';
import { Unit, Flashcard } from '../lib/types';
import { generateId, getCurrentTimestamp } from '../lib/utils';
import Button from '../components/common/Button';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import FlashcardEditor from '../components/flashcards/FlashcardEditor';
import FlashcardViewer from '../components/flashcards/FlashcardViewer';
import Modal, { ModalFooter } from '../components/common/Modal';

const FlashcardsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string | 'all'>('all');
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Find the current course
  const course = state.courses.find(c => c.id === courseId);
  
  // Load units and flashcards for this course
  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Load units for this course
        const courseUnits = await getUnitsByCourse(courseId);
        setUnits(courseUnits.sort((a, b) => a.orderIndex - b.orderIndex));
        
        // Load flashcards for this course
        const courseFlashcards = await getFlashcardsByCourse(courseId);
        setFlashcards(courseFlashcards);
        setFilteredFlashcards(courseFlashcards);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading units and flashcards:', err);
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
  
  // Filter flashcards when selected unit changes
  useEffect(() => {
    if (selectedUnit === 'all') {
      setFilteredFlashcards(flashcards);
    } else {
      setFilteredFlashcards(flashcards.filter(card => card.unitId === selectedUnit));
    }
  }, [flashcards, selectedUnit]);
  
  // Handle adding a new flashcard
  const handleAddFlashcard = async (flashcardData: {
    unitId: string;
    question: string;
    answer: string;
    tags?: string[];
  }) => {
    if (!courseId) return;
    
    try {
      setIsLoading(true);
      
      const now = getCurrentTimestamp();
      const newFlashcard: Flashcard = {
        id: generateId(),
        courseId,
        unitId: flashcardData.unitId,
        question: flashcardData.question,
        answer: flashcardData.answer,
        tags: flashcardData.tags || [],
        reviewCount: 0,
        confidenceLevel: 1,
        lastReviewed: undefined,
        createdAt: now,
        updatedAt: now,
      };
      
      await add('flashcards', newFlashcard);
      setFlashcards([...flashcards, newFlashcard]);
      setIsAddModalOpen(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Error adding flashcard:', err);
      setError('Failed to add flashcard');
      setIsLoading(false);
    }
  };
  
  // Handle updating a flashcard
  const handleUpdateFlashcard = async (flashcardData: {
    question: string;
    answer: string;
    tags?: string[];
  }) => {
    if (!currentFlashcard) return;
    
    try {
      setIsLoading(true);
      
      const updatedFlashcard: Flashcard = {
        ...currentFlashcard,
        question: flashcardData.question,
        answer: flashcardData.answer,
        tags: flashcardData.tags || [],
        updatedAt: getCurrentTimestamp(),
      };
      
      await update('flashcards', updatedFlashcard);
      setFlashcards(flashcards.map(card => 
        card.id === updatedFlashcard.id ? updatedFlashcard : card
      ));
      setIsEditModalOpen(false);
      setCurrentFlashcard(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error updating flashcard:', err);
      setError('Failed to update flashcard');
      setIsLoading(false);
    }
  };
  
  // Handle deleting a flashcard
  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (!window.confirm('Are you sure you want to delete this flashcard?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      await remove('flashcards', flashcardId);
      setFlashcards(flashcards.filter(card => card.id !== flashcardId));
      
      if (currentFlashcard && currentFlashcard.id === flashcardId) {
        setCurrentFlashcard(null);
        setIsEditModalOpen(false);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error deleting flashcard:', err);
      setError('Failed to delete flashcard');
      setIsLoading(false);
    }
  };
  
  // Handle updating confidence level after review
  const handleUpdateConfidence = async (flashcardId: string, confidenceLevel: number) => {
    try {
      const flashcard = flashcards.find(card => card.id === flashcardId);
      if (!flashcard) return;
      
      const now = getCurrentTimestamp();
      const updatedFlashcard: Flashcard = {
        ...flashcard,
        confidenceLevel,
        reviewCount: flashcard.reviewCount + 1,
        lastReviewed: now,
        updatedAt: now,
      };
      
      await update('flashcards', updatedFlashcard);
      setFlashcards(flashcards.map(card => 
        card.id === updatedFlashcard.id ? updatedFlashcard : card
      ));
    } catch (err) {
      console.error('Error updating confidence level:', err);
      setError('Failed to update review status');
    }
  };
  
  // If loading, show loading state
  if (isLoading && units.length === 0 && flashcards.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading flashcards...</p>
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
            {course.name} - Flashcards
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and study flashcards for this course
          </p>
        </div>
        
        <div className="mt-3 md:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsStudyMode(prev => !prev)}
            disabled={filteredFlashcards.length === 0}
          >
            {isStudyMode ? 'Exit Study Mode' : 'Start Studying'}
          </Button>
          
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            disabled={units.length === 0}
          >
            Add Flashcard
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded">
          {error}
        </div>
      )}
      
      {!isStudyMode ? (
        <div className="space-y-6">
          {/* Unit filter */}
          <Card>
            <CardContent className="py-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedUnit('all')}
                  className={`px-3 py-1.5 text-sm rounded-full ${
                    selectedUnit === 'all'
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All Units ({flashcards.length})
                </button>
                
                {units.map(unit => (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit.id)}
                    className={`px-3 py-1.5 text-sm rounded-full ${
                      selectedUnit === unit.id
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {unit.name} ({flashcards.filter(card => card.unitId === unit.id).length})
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Flashcards grid */}
          {filteredFlashcards.length === 0 ? (
            <Card>
              <CardContent>
                <div className="text-center py-12">
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
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No Flashcards Found
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {units.length === 0
                      ? 'You need to create units before adding flashcards.'
                      : selectedUnit === 'all'
                      ? 'Create your first flashcard to start studying.'
                      : 'No flashcards in this unit yet.'}
                  </p>
                  {units.length > 0 && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      Create New Flashcard
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFlashcards.map(flashcard => (
                <FlashcardEditor
                  key={flashcard.id}
                  flashcard={flashcard}
                  unitName={units.find(u => u.id === flashcard.unitId)?.name || 'Unknown Unit'}
                  onEdit={() => {
                    setCurrentFlashcard(flashcard);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={() => handleDeleteFlashcard(flashcard.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <FlashcardViewer
          flashcards={filteredFlashcards}
          onUpdateConfidence={handleUpdateConfidence}
          onExit={() => setIsStudyMode(false)}
        />
      )}
      
      {/* Add Flashcard Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Flashcard"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="flashcardUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Unit *
            </label>
            <select
              id="flashcardUnit"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="flashcardQuestion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Question *
            </label>
            <textarea
              id="flashcardQuestion"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter the question..."
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="flashcardAnswer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Answer *
            </label>
            <textarea
              id="flashcardAnswer"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter the answer..."
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="flashcardTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags (Optional, comma separated)
            </label>
            <input
              type="text"
              id="flashcardTags"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="e.g. important, exam, definition"
            />
          </div>
        </div>
        
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const unitSelect = document.getElementById('flashcardUnit') as HTMLSelectElement;
              const questionTextarea = document.getElementById('flashcardQuestion') as HTMLTextAreaElement;
              const answerTextarea = document.getElementById('flashcardAnswer') as HTMLTextAreaElement;
              const tagsInput = document.getElementById('flashcardTags') as HTMLInputElement;
              
              if (
                unitSelect && 
                questionTextarea && 
                answerTextarea && 
                questionTextarea.value.trim() && 
                answerTextarea.value.trim()
              ) {
                const tags = tagsInput.value
                  ? tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  : [];
                
                handleAddFlashcard({
                  unitId: unitSelect.value,
                  question: questionTextarea.value.trim(),
                  answer: answerTextarea.value.trim(),
                  tags,
                });
              }
            }}
          >
            Create Flashcard
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Edit Flashcard Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCurrentFlashcard(null);
        }}
        title="Edit Flashcard"
      >
        {currentFlashcard && (
          <div className="space-y-4">
            <div>
              <label htmlFor="editFlashcardQuestion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Question *
              </label>
              <textarea
                id="editFlashcardQuestion"
                rows={3}
                defaultValue={currentFlashcard.question}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="editFlashcardAnswer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Answer *
              </label>
              <textarea
                id="editFlashcardAnswer"
                rows={3}
                defaultValue={currentFlashcard.answer}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="editFlashcardTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags (Optional, comma separated)
              </label>
              <input
                type="text"
                id="editFlashcardTags"
                defaultValue={currentFlashcard.tags?.join(', ') || ''}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            
            <ModalFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentFlashcard(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const questionTextarea = document.getElementById('editFlashcardQuestion') as HTMLTextAreaElement;
                  const answerTextarea = document.getElementById('editFlashcardAnswer') as HTMLTextAreaElement;
                  const tagsInput = document.getElementById('editFlashcardTags') as HTMLInputElement;
                  
                  if (
                    questionTextarea && 
                    answerTextarea && 
                    questionTextarea.value.trim() && 
                    answerTextarea.value.trim()
                  ) {
                    const tags = tagsInput.value
                      ? tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      : [];
                    
                    handleUpdateFlashcard({
                      question: questionTextarea.value.trim(),
                      answer: answerTextarea.value.trim(),
                      tags,
                    });
                  }
                }}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FlashcardsPage;