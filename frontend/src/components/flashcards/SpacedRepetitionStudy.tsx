import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard } from '../../lib/types';
import Card, { CardContent } from '../common/Card';
import Button from '../common/Button';

interface SpacedRepetitionStudyProps {
  flashcards: Flashcard[];
  onUpdateConfidence: (flashcardId: string, confidenceLevel: number) => void;
  onExit: () => void;
}

interface StudyState {
  flashcards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  isFinished: boolean;
  reviewedCount: number;
  progress: number;
}

const SpacedRepetitionStudy = ({
  flashcards,
  onUpdateConfidence,
  onExit,
}: SpacedRepetitionStudyProps) => {
  const [studyState, setStudyState] = useState<StudyState>({
    flashcards: [],
    currentIndex: 0,
    isFlipped: false,
    isFinished: false,
    reviewedCount: 0,
    progress: 0,
  });

  // Initialize study session
  useEffect(() => {
    if (flashcards.length === 0) return;

    // Sort flashcards by confidence level and last reviewed date
    // Prioritize cards with:
    // 1. Lower confidence level
    // 2. Cards not reviewed recently
    // 3. Apply some randomization to prevent predictability
    const prioritizedCards = [...flashcards].sort((a, b) => {
      // First prioritize by confidence level
      if (a.confidenceLevel !== b.confidenceLevel) {
        return a.confidenceLevel - b.confidenceLevel;
      }
      
      // If same confidence, prioritize by last reviewed date
      // (null/undefined lastReviewed comes first - never reviewed)
      if (!a.lastReviewed && b.lastReviewed) return -1;
      if (a.lastReviewed && !b.lastReviewed) return 1;
      if (a.lastReviewed && b.lastReviewed) {
        return a.lastReviewed - b.lastReviewed;
      }
      
      // Add some randomness for cards with same priority
      return Math.random() - 0.5;
    });
    
    setStudyState({
      flashcards: prioritizedCards,
      currentIndex: 0,
      isFlipped: false,
      isFinished: false,
      reviewedCount: 0,
      progress: 0,
    });
  }, [flashcards]);

  // Current flashcard
  const currentFlashcard = studyState.flashcards[studyState.currentIndex];

  // Handle flipping the flashcard
  const handleFlip = () => {
    setStudyState((prev) => ({
      ...prev,
      isFlipped: !prev.isFlipped,
    }));
  };

  // Handle rating confidence
  const handleRateConfidence = (confidenceLevel: number) => {
    if (!currentFlashcard) return;

    // Update the confidence level via callback
    onUpdateConfidence(currentFlashcard.id, confidenceLevel);

    // Calculate progress
    const progress = Math.min(
      100,
      Math.round(((studyState.currentIndex + 1) / studyState.flashcards.length) * 100)
    );

    // Move to next card or finish if no more cards
    if (studyState.currentIndex < studyState.flashcards.length - 1) {
      setStudyState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        isFlipped: false,
        reviewedCount: prev.reviewedCount + 1,
        progress,
      }));
    } else {
      // Study session complete
      setStudyState((prev) => ({
        ...prev,
        isFinished: true,
        reviewedCount: prev.reviewedCount + 1,
        progress: 100,
      }));
    }
  };

  // Skip current card (will be shown again later)
  const handleSkip = () => {
    if (studyState.currentIndex < studyState.flashcards.length - 1) {
      setStudyState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        isFlipped: false,
        progress: Math.round(((prev.currentIndex + 1) / prev.flashcards.length) * 100),
      }));
    } else {
      // No more cards to skip to
      setStudyState((prev) => ({
        ...prev,
        isFinished: true,
        progress: 100,
      }));
    }
  };

  // Restart study session
  const handleRestart = () => {
    // Reshuffle cards with priority for lower confidence
    const reshuffled = [...flashcards].sort((a, b) => {
      if (a.confidenceLevel !== b.confidenceLevel) {
        return a.confidenceLevel - b.confidenceLevel;
      }
      return Math.random() - 0.5;
    });

    setStudyState({
      flashcards: reshuffled,
      currentIndex: 0,
      isFlipped: false,
      isFinished: false,
      reviewedCount: 0,
      progress: 0,
    });
  };

  // Display confidence level description
  const getConfidenceLevelDescription = (level: number): string => {
    switch (level) {
      case 1:
        return "I don't know this at all";
      case 2:
        return "I barely remember this";
      case 3:
        return "I'm somewhat familiar with this";
      case 4:
        return "I know this well";
      case 5:
        return "I know this perfectly";
      default:
        return "How well did you know this?";
    }
  };

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

  if (studyState.isFinished) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Study Session Complete!
          </h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            You've reviewed {studyState.reviewedCount} flashcards in this session.
          </p>
          
          {/* Stats visualization */}
          <div className="w-full max-w-md mx-auto mb-8 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Your Progress</h3>
            
            {/* We'd display actual stats here in a real implementation */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cards reviewed:</span>
              <span className="font-medium text-gray-900 dark:text-white">{studyState.reviewedCount}</span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Study streak:</span>
              <span className="font-medium text-gray-900 dark:text-white">1 day</span>
            </div>
            
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Keep studying daily to improve your memory retention!
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={handleRestart}>
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
          <span>
            {studyState.currentIndex + 1} of {studyState.flashcards.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${studyState.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Flashcard */}
      {currentFlashcard && (
        <div className="mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${studyState.currentIndex}-${studyState.isFlipped ? "flipped" : "front"}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full perspective-1000"
            >
              <Card className="min-h-[300px] flex flex-col backface-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="font-medium">
                    {studyState.isFlipped ? "Answer" : "Question"}
                  </span>
                  <div className="flex items-center">
                    {/* Confidence indicator */}
                    {currentFlashcard.confidenceLevel > 0 && (
                      <div className="mr-3 flex items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                          Confidence:
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-1.5 h-6 mx-px rounded-sm ${
                                level <= currentFlashcard.confidenceLevel
                                  ? level === 1
                                    ? "bg-red-400 dark:bg-red-600"
                                    : level === 2
                                    ? "bg-orange-400 dark:bg-orange-600"
                                    : level === 3
                                    ? "bg-yellow-400 dark:bg-yellow-600"
                                    : level === 4
                                    ? "bg-blue-400 dark:bg-blue-600"
                                    : "bg-green-400 dark:bg-green-600"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                    
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
                </div>
                
                <CardContent className="flex-1 flex items-center justify-center p-6">
                  <div className="text-lg text-gray-900 dark:text-white text-center">
                    {studyState.isFlipped ? currentFlashcard.answer : currentFlashcard.question}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6">
        {!studyState.isFlipped ? (
          <div className="text-center">
            <Button variant="primary" onClick={handleFlip} className="w-full py-3">
              Show Answer
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-center mb-3 text-gray-700 dark:text-gray-300">
              {getConfidenceLevelDescription(0)}
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
                <span className="block text-sm">Well</span>
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
        <Button variant="outline" onClick={onExit}>
          Exit Study Mode
        </Button>

        {!studyState.isFlipped && (
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
        )}
      </div>
    </div>
  );
};

export default SpacedRepetitionStudy;