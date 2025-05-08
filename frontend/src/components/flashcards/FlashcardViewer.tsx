import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard } from '../../lib/types';
import Card, { CardContent } from '../common/Card';
import Button from '../common/Button';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onUpdateConfidence: (flashcardId: string, confidenceLevel: number) => void;
  onExit: () => void;
}

const FlashcardViewer = ({ 
  flashcards,
  onUpdateConfidence,
  onExit
}: FlashcardViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [studyComplete, setStudyComplete] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [remainingFlashcards, setRemainingFlashcards] = useState<Flashcard[]>([]);
  
      // Initialize the study session
  useEffect(() => {
    // Shuffle the flashcards for randomized study
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setRemainingFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setProgress(0);
    setStudyComplete(false);
    setReviewedCount(0);
  }, [flashcards]);
  
  // Current flashcard being studied
  const currentFlashcard = remainingFlashcards[currentIndex];
  
  // Handle flipping the flashcard
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  // Move to the next flashcard
  const handleNext = () => {
    if (currentIndex < remainingFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setProgress(Math.round(((currentIndex + 1) / remainingFlashcards.length) * 100));
    } else {
      setStudyComplete(true);
    }
  };
  
  // Handle rating confidence level
  const handleRateConfidence = (confidenceLevel: number) => {
    if (currentFlashcard) {
      onUpdateConfidence(currentFlashcard.id, confidenceLevel);
      setReviewedCount(reviewedCount + 1);
      handleNext();
    }
  };
  
  // If no flashcards, show message
  if (flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <p className="mb-4 text-gray-700 dark:text-gray-300">No flashcards available for study.</p>
          <Button variant="primary" onClick={onExit}>
            Exit Study Mode
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Show study complete screen
  if (studyComplete) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Study Session Complete!
          </h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            You've reviewed {reviewedCount} flashcards in this session.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => {
                // Restart the session with a new shuffle
                const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
                setRemainingFlashcards(shuffled);
                setCurrentIndex(0);
                setIsFlipped(false);
                setProgress(0);
                setStudyComplete(false);
              }}
            >
              Study Again
            </Button>
            <Button variant="primary" onClick={onExit}>
              Exit Study Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{currentIndex + 1} of {remainingFlashcards.length}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Flashcard */}
      <div className="mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + (isFlipped ? '-flipped' : '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card className="min-h-[300px] flex flex-col">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="font-medium">
                  {isFlipped ? 'Answer' : 'Question'}
                </span>
                <button
                  onClick={handleFlip}
                  className="p-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
              <CardContent className="flex-1 flex items-center justify-center p-6">
                <div className="text-lg text-gray-900 dark:text-white">
                  {isFlipped ? currentFlashcard.answer : currentFlashcard.question}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Controls */}
      <div className="mb-6">
        {!isFlipped ? (
          <div className="text-center">
            <Button variant="primary" onClick={handleFlip} className="w-full py-3">
              Show Answer
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-center mb-3 text-gray-700 dark:text-gray-300">
              How well did you know this?
            </p>
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={() => handleRateConfidence(1)}
                className="p-2 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
              >
                <span className="block text-sm">Not at all</span>
                <span className="text-xs">1</span>
              </button>
              <button
                onClick={() => handleRateConfidence(2)}
                className="p-2 rounded bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800"
              >
                <span className="block text-sm">Barely</span>
                <span className="text-xs">2</span>
              </button>
              <button
                onClick={() => handleRateConfidence(3)}
                className="p-2 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800"
              >
                <span className="block text-sm">Somewhat</span>
                <span className="text-xs">3</span>
              </button>
              <button
                onClick={() => handleRateConfidence(4)}
                className="p-2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                <span className="block text-sm">Mostly</span>
                <span className="text-xs">4</span>
              </button>
              <button
                onClick={() => handleRateConfidence(5)}
                className="p-2 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
              >
                <span className="block text-sm">Perfectly</span>
                <span className="text-xs">5</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onExit}
        >
          Exit Study Mode
        </Button>
        
        {!isFlipped && (
          <Button
            variant="outline"
            onClick={handleNext}
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
};

export default FlashcardViewer;