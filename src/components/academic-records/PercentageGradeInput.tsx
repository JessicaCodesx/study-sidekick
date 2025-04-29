import { useState, useEffect } from 'react';
import { percentageToLetterGrade, getGradeColor } from '../../lib/gradeUtils';

interface GradeInputProps {
  initialValue?: number;
  onChange: (percentage: number | undefined, letterGrade: string | undefined) => void;
  disabled?: boolean;
}

const PercentageGradeInput: React.FC<GradeInputProps> = ({ 
  initialValue, 
  onChange,
  disabled = false
}) => {
  const [percentage, setPercentage] = useState<string>(
    initialValue !== undefined ? initialValue.toString() : ''
  );
  const [letterGrade, setLetterGrade] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);

  // Calculate letter grade when percentage changes
  useEffect(() => {
    if (percentage === '') {
      setLetterGrade('');
      onChange(undefined, undefined);
      setIsValid(true);
      return;
    }

    const numericValue = parseFloat(percentage);
    
    if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
      setIsValid(false);
      setLetterGrade('');
      return;
    }

    setIsValid(true);
    const calculatedLetterGrade = percentageToLetterGrade(numericValue);
    setLetterGrade(calculatedLetterGrade);
    
    // Notify parent component of both percentage and letter grade
    onChange(numericValue, calculatedLetterGrade);
  }, [percentage, onChange]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPercentage(e.target.value);
  };

  return (
    <div className="w-full">
      <div className="flex rounded-md shadow-sm">
        <input
          type="number"
          value={percentage}
          onChange={handleChange}
          min="0"
          max="100"
          step="0.1"
          disabled={disabled}
          placeholder="Enter grade %"
          className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border ${
            !isValid 
              ? 'border-red-300 dark:border-red-700 theme-pink:border-red-300' 
              : 'border-gray-300 dark:border-gray-700 theme-pink:border-pink-300'
          } focus:ring-primary-500 focus:border-primary-500 theme-pink:focus:ring-pink-500 theme-pink:focus:border-pink-500 sm:text-sm dark:bg-gray-800`}
          aria-invalid={!isValid}
          aria-describedby={!isValid ? "percentage-error" : undefined}
        />
        <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-700 theme-pink:border-pink-300 bg-gray-50 dark:bg-gray-700 theme-pink:bg-pink-50 text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 sm:text-sm">
          %
        </span>
      </div>
      
      {!isValid && (
        <p id="percentage-error" className="mt-1 text-sm text-red-600 dark:text-red-400 theme-pink:text-red-500">
          Please enter a valid percentage (0-100)
        </p>
      )}
      
      {isValid && letterGrade && (
        <div className="mt-1.5 text-sm">
          <span className="text-gray-500 dark:text-gray-400 theme-pink:text-pink-500">Letter Grade: </span>
          <span className={`font-medium ${getGradeColor(letterGrade)}`}>
            {letterGrade}
          </span>
        </div>
      )}
    </div>
  );
};

export default PercentageGradeInput;