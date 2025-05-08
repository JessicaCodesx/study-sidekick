import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flashcard } from '../../lib/types';
import Card from '../common/Card';

interface FlashcardEditorProps {
  flashcard: Flashcard;
  unitName: string;
  onEdit: () => void;
  onDelete: () => void;
}

const FlashcardEditor = ({ 
  flashcard, 
  unitName, 
  onEdit, 
  onDelete 
}: FlashcardEditorProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get confidence level label
  const getConfidenceLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return { label: 'Low', color: 'text-red-600 dark:text-red-400' };
      case 2:
        return { label: 'Medium-Low', color: 'text-orange-600 dark:text-orange-400' };
      case 3:
        return { label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' };
      case 4:
        return { label: 'Medium-High', color: 'text-blue-600 dark:text-blue-400' };
      case 5:
        return { label: 'High', color: 'text-green-600 dark:text-green-400' };
      default:
        return { label: 'Not Reviewed', color: 'text-gray-600 dark:text-gray-400' };
    }
  };
  
  const confidenceInfo = getConfidenceLevelLabel(flashcard.confidenceLevel);
  
  return (
    <div className="h-full">
      <Card 
        variant="hover" 
        className="h-full flex flex-col cursor-pointer transition-all duration-500 perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front side (Question) */}
          <div className={`absolute inset-0 backface-hidden ${isFlipped ? 'hidden' : 'block'}`}>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {unitName}
                </span>
              </div>
              
              <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                <button
                  onClick={onEdit}
                  className="p-1 rounded-full text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                  aria-label="Edit flashcard"
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
                  onClick={onDelete}
                  className="p-1 rounded-full text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                  aria-label="Delete flashcard"
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
            
            <div className="px-4 py-3 flex-1">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Question:</h3>
              <div className="text-gray-900 dark:text-white text-base">{flashcard.question}</div>
              
              {flashcard.tags && flashcard.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {flashcard.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
              <div>
                <span>Created: {formatDate(flashcard.createdAt)}</span>
              </div>
              <div>
                <span className={confidenceInfo.color}>
                  {flashcard.confidenceLevel > 0 ? `Confidence: ${confidenceInfo.label}` : 'Not yet reviewed'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Back side (Answer) */}
          <div className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? 'block' : 'hidden'}`}>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Answer
              </span>
            </div>
            
            <div className="px-4 py-3 flex-1">
              <div className="text-gray-900 dark:text-white text-base">{flashcard.answer}</div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
              <div>
                <span>
                  {flashcard.reviewCount > 0 
                    ? `Reviewed ${flashcard.reviewCount} ${flashcard.reviewCount === 1 ? 'time' : 'times'}`
                    : 'Not yet reviewed'}
                </span>
              </div>
              <div>
                {flashcard.lastReviewed && (
                  <span>Last review: {formatDate(flashcard.lastReviewed)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FlashcardEditor;