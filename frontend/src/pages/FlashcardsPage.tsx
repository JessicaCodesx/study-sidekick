import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getAll, add, update, remove } from '../lib/db';
import { Course, Unit, Flashcard } from '../lib/types';
import { generateId, getCurrentTimestamp } from '../lib/utils';
import Button from '../components/common/Button';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import Modal, { ModalFooter } from '../components/common/Modal';
import PageContainer from '../components/layout/PageContainer';
import SpacedRepetitionStudy from '../components/flashcards/SpacedRepetitionStudy';

const FlashcardsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string | 'all'>('all');
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load course, units, and flashcards
  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load course
        const foundCourse = state.courses.find(c => c.id === courseId);
        if (!foundCourse) {
          setError('Course not found');
          setIsLoading(false);
          return;
        }
        setCourse(foundCourse);

        // Load units for this course
        let courseUnits: Unit[];
        if (state.units.length > 0) {
          courseUnits = state.units.filter(unit => unit.courseId === courseId);
        } else {
          courseUnits = await getAll('units', unit => unit.courseId === courseId);
          dispatch({ type: 'SET_UNITS', payload: courseUnits });
        }
        setUnits(courseUnits);

        // Load flashcards for this course
        let courseFlashcards: Flashcard[];
        if (state.flashcards.length > 0) {
          courseFlashcards = state.flashcards.filter(fc => fc.courseId === courseId);
        } else {
          courseFlashcards = await getAll('flashcards', fc => fc.courseId === courseId);
          dispatch({ type: 'SET_FLASHCARDS', payload: courseFlashcards });
        }
        setFlashcards(courseFlashcards);

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading flashcards data:', err);
        setError('Failed to load flashcards');
        setIsLoading(false);
      }
    };

    loadData();
  }, [courseId, state.courses, state.units, state.flashcards, dispatch]);

  // Filter flashcards when unit selection changes
  useEffect(() => {
    if (selectedUnit === 'all') {
      setFilteredFlashcards(flashcards);
    } else {
      setFilteredFlashcards(flashcards.filter(fc => fc.unitId === selectedUnit));
    }
  }, [selectedUnit, flashcards]);

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
        ...flashcardData,
        reviewCount: 0,
        confidenceLevel: 0,
        createdAt: now,
        updatedAt: now,
      };

      await add('flashcards', newFlashcard);

      // Update local and global state
      const updatedFlashcards = [...flashcards, newFlashcard];
      setFlashcards(updatedFlashcards);
      dispatch({ type: 'ADD_FLASHCARD', payload: newFlashcard });

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
    unitId: string;
    question: string;
    answer: string;
    tags?: string[];
  }) => {
    if (!currentFlashcard) return;

    try {
      setIsLoading(true);

      const updatedFlashcard: Flashcard = {
        ...currentFlashcard,
        ...flashcardData,
        updatedAt: getCurrentTimestamp(),
      };

      await update('flashcards', updatedFlashcard);

      // Update local and global state
      const updatedFlashcards = flashcards.map(fc => 
        fc.id === updatedFlashcard.id ? updatedFlashcard : fc
      );
      setFlashcards(updatedFlashcards);
      dispatch({ type: 'UPDATE_FLASHCARD', payload: updatedFlashcard });

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

      // Update local and global state
      const updatedFlashcards = flashcards.filter(fc => fc.id !== flashcardId);
      setFlashcards(updatedFlashcards);
      dispatch({ type: 'DELETE_FLASHCARD', payload: flashcardId });

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

  // Handle updating flashcard confidence level
  const handleUpdateConfidence = async (flashcardId: string, confidenceLevel: number) => {
    try {
      const flashcard = flashcards.find(fc => fc.id === flashcardId);
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

      // Update local and global state
      const updatedFlashcards = flashcards.map(fc => 
        fc.id === updatedFlashcard.id ? updatedFlashcard : fc
      );
      setFlashcards(updatedFlashcards);
      dispatch({ type: 'UPDATE_FLASHCARD', payload: updatedFlashcard });

      // Also update user's study streak
      if (state.user) {
        const updatedUser = {
          ...state.user,
          lastStudyDate: now,
          studyStreak: (state.user.lastStudyDate && isToday(state.user.lastStudyDate)) 
            ? state.user.studyStreak 
            : state.user.studyStreak + 1,
        };
        
        await update('user', updatedUser);
        dispatch({ type: 'SET_USER', payload: updatedUser });
      }
    } catch (err) {
      console.error('Error updating flashcard confidence:', err);
      setError('Failed to update study progress');
    }
  };

  // Helper function to check if a timestamp is from today
  const isToday = (timestamp: number): boolean => {
    const today = new Date();
    const date = new Date(timestamp);
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Get unit name by ID
  const getUnitName = (unitId: string): string => {
    const unit = units.find(unit => unit.id === unitId);
    return unit ? unit.name : 'Unknown Unit';
  };

  // Get confidence level label
  const getConfidenceLevelLabel = (level: number): string => {
    switch (level) {
      case 0: return 'Not Reviewed';
      case 1: return 'Not at all';
      case 2: return 'Barely';
      case 3: return 'Somewhat';
      case 4: return 'Well';
      case 5: return 'Perfectly';
      default: return 'Unknown';
    }
  };

  // Get confidence level color
  const getConfidenceLevelColor = (level: number): string => {
    switch (level) {
      case 0: return 'bg-gray-200 dark:bg-gray-700 theme-pink:bg-gray-200';
      case 1: return 'bg-red-200 dark:bg-red-900 theme-pink:bg-red-200';
      case 2: return 'bg-orange-200 dark:bg-orange-900 theme-pink:bg-orange-200';
      case 3: return 'bg-yellow-200 dark:bg-yellow-900 theme-pink:bg-yellow-200';
      case 4: return 'bg-blue-200 dark:bg-blue-900 theme-pink:bg-blue-200';
      case 5: return 'bg-green-200 dark:bg-green-900 theme-pink:bg-green-200';
      default: return 'bg-gray-200 dark:bg-gray-700 theme-pink:bg-gray-200';
    }
  };

  if (studyMode) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white theme-pink:text-pink-600">Flashcard Study Session</h1>
          <Button
            variant="outline"
            onClick={() => setStudyMode(false)}
          >
            Exit Study Mode
          </Button>
        </div>
        
        <SpacedRepetitionStudy
          flashcards={filteredFlashcards}
          onUpdateConfidence={handleUpdateConfidence}
          onExit={() => setStudyMode(false)}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white theme-pink:text-pink-600">
            {course ? `${course.name} - Flashcards` : 'Flashcards'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">
            Create and manage flashcards for this course
          </p>
        </div>
        
        <div className="mt-3 md:mt-0 space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/courses/${courseId}/notes`)}
          >
            View Notes
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Flashcard
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 theme-pink:bg-pink-100 theme-pink:text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Statistics Card */}
        <Card className="lg:col-span-1">
          <CardTitle>Statistics</CardTitle>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wider">
                  Flashcards
                </h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white theme-pink:text-pink-600">
                  {flashcards.length}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wider">
                  Mastered
                </h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white theme-pink:text-pink-600">
                  {flashcards.filter(fc => fc.confidenceLevel >= 4).length}
                </p>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 theme-pink:bg-pink-100 rounded-full h-2.5">
                  <div
                    className="bg-green-500 dark:bg-green-600 theme-pink:bg-pink-400 h-2.5 rounded-full"
                    style={{ width: `${flashcards.length > 0 ? (flashcards.filter(fc => fc.confidenceLevel >= 4).length / flashcards.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wider">
                  Need Review
                </h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white theme-pink:text-pink-600">
                  {flashcards.filter(fc => fc.confidenceLevel < 4 && fc.confidenceLevel > 0).length}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 uppercase tracking-wider">
                  Not Started
                </h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white theme-pink:text-pink-600">
                  {flashcards.filter(fc => fc.confidenceLevel === 0).length}
                </p>
              </div>
              
              <div className="pt-4">
                <Button
                  variant="primary"
                  onClick={() => setStudyMode(true)}
                  isFullWidth
                  disabled={filteredFlashcards.length === 0}
                >
                  Start Studying
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Flashcards List */}
        <div className="lg:col-span-3">
          <Card>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 theme-pink:border-pink-200 flex flex-wrap justify-between items-center">
              <CardTitle className="mb-0">Flashcards</CardTitle>
              
              <div className="flex items-center mt-2 md:mt-0">
                <span className="text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-500 mr-2">Filter by Unit:</span>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value as string | 'all')}
                  className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 theme-pink:bg-white shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 text-sm"
                >
                  <option value="all">All Units</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <CardContent>
              {isLoading && flashcards.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent theme-pink:border-pink-400 theme-pink:border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">Loading flashcards...</p>
                </div>
              ) : filteredFlashcards.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 theme-pink:text-pink-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white theme-pink:text-pink-600">
                    No Flashcards Found
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">
                    {selectedUnit === 'all'
                      ? "You haven't created any flashcards for this course yet."
                      : "No flashcards found for this unit."}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Create Your First Flashcard
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFlashcards.map(flashcard => (
                    <div 
                      key={flashcard.id} 
                      className="border border-gray-200 dark:border-gray-700 theme-pink:border-pink-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className={`px-4 py-2 ${getConfidenceLevelColor(flashcard.confidenceLevel)}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-800 dark:text-gray-200 theme-pink:text-gray-800">
                            {getUnitName(flashcard.unitId)}
                          </span>
                          <span className="text-xs font-medium text-gray-800 dark:text-gray-200 theme-pink:text-gray-800">
                            Confidence: {getConfidenceLevelLabel(flashcard.confidenceLevel)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white theme-pink:text-gray-900 mb-2">
                          {flashcard.question}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 theme-pink:text-gray-600 text-sm">
                          {flashcard.answer}
                        </p>
                      </div>
                      
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 theme-pink:bg-pink-50 border-t border-gray-200 dark:border-gray-700 theme-pink:border-pink-200 flex justify-between">
                        <div className="flex space-x-1">
                          {flashcard.tags && flashcard.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="bg-gray-200 dark:bg-gray-700 theme-pink:bg-pink-100 text-gray-700 dark:text-gray-300 theme-pink:text-pink-700 text-xs px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setCurrentFlashcard(flashcard);
                              setIsEditModalOpen(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 theme-pink:text-pink-600 text-sm hover:text-blue-800 dark:hover:text-blue-300 theme-pink:hover:text-pink-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteFlashcard(flashcard.id)}
                            className="text-red-600 dark:text-red-400 theme-pink:text-red-600 text-sm hover:text-red-800 dark:hover:text-red-300 theme-pink:hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Flashcard Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Flashcard"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="unitId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
              Unit *
            </label>
            <select
              id="unitId"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
            >
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="flashcardQuestion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
              Question *
            </label>
            <textarea
              id="flashcardQuestion"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              placeholder="What is the question?"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="flashcardAnswer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
              Answer *
            </label>
            <textarea
              id="flashcardAnswer"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              placeholder="What is the answer?"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="flashcardTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="flashcardTags"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              placeholder="concept, term, important, etc."
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
              const unitSelect = document.getElementById('unitId') as HTMLSelectElement;
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
                // Parse tags
                const tags = tagsInput.value
                  ? tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  : undefined;
                
                handleAddFlashcard({
                  unitId: unitSelect.value,
                  question: questionTextarea.value.trim(),
                  answer: answerTextarea.value.trim(),
                  tags,
                });
              }
            }}
          >
            Add Flashcard
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
              <label htmlFor="editUnitId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Unit *
              </label>
              <select
                id="editUnitId"
                defaultValue={currentFlashcard.unitId}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              >
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="editFlashcardQuestion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Question *
              </label>
              <textarea
                id="editFlashcardQuestion"
                rows={3}
                defaultValue={currentFlashcard.question}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="editFlashcardAnswer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Answer *
              </label>
              <textarea
                id="editFlashcardAnswer"
                rows={3}
                defaultValue={currentFlashcard.answer}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
                ></textarea>
              </div>
  
              <div>
                <label htmlFor="editFlashcardTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="editFlashcardTags"
                  defaultValue={currentFlashcard.tags?.join(', ') || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
                  placeholder="concept, term, important, etc."
                />
              </div>
            </div>
          )}
  
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
                const unitSelect = document.getElementById('editUnitId') as HTMLSelectElement;
                const questionTextarea = document.getElementById('editFlashcardQuestion') as HTMLTextAreaElement;
                const answerTextarea = document.getElementById('editFlashcardAnswer') as HTMLTextAreaElement;
                const tagsInput = document.getElementById('editFlashcardTags') as HTMLInputElement;
  
                if (
                  unitSelect &&
                  questionTextarea &&
                  answerTextarea &&
                  questionTextarea.value.trim() &&
                  answerTextarea.value.trim()
                ) {
                  const tags = tagsInput.value
                    ? tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    : undefined;
  
                  handleUpdateFlashcard({
                    unitId: unitSelect.value,
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
        </Modal>
      </PageContainer>
    );
  };
  
  export default FlashcardsPage;
  
