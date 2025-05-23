// Function to convert percentage grade to letter grade
export function percentageToLetterGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 77) return 'B+';
  if (percentage >= 73) return 'B';
  if (percentage >= 70) return 'B-';
  if (percentage >= 67) return 'C+';
  if (percentage >= 63) return 'C';
  if (percentage >= 60) return 'C-';
  if (percentage >= 57) return 'D+';
  if (percentage >= 53) return 'D';
  if (percentage >= 50) return 'D-';
  return 'F';
}
 // Convert letter grade to midpoint percentage
export function letterGradeToPercentage(letterGrade: string): number {
  switch (letterGrade.toUpperCase()) {
    case 'A+': return 95;
    case 'A': return 87;
    case 'A-': return 82;
    case 'B+': return 78;
    case 'B': return 75;
    case 'B-': return 71;
    case 'C+': return 68;
    case 'C': return 65;
    case 'C-': return 61;
    case 'D+': return 58;
    case 'D': return 55;
    case 'D-': return 51;
    case 'F': return 25;
    default: return NaN;
  }
}

  
  // Function to get letter grade color
  export function getGradeColor(grade: string | number | undefined): string {
    if (!grade) return 'text-gray-600 dark:text-gray-400 theme-pink:text-gray-500';
    
    // If grade is a number (percentage), convert to letter first
    const letterGrade = typeof grade === 'number' 
      ? percentageToLetterGrade(grade)
      : grade.toUpperCase();
    
    if (letterGrade.startsWith('A')) return 'text-green-600 dark:text-green-400 theme-pink:text-green-600';
    if (letterGrade.startsWith('B')) return 'text-blue-600 dark:text-blue-400 theme-pink:text-blue-600';
    if (letterGrade.startsWith('C')) return 'text-yellow-600 dark:text-yellow-400 theme-pink:text-yellow-600';
    if (letterGrade.startsWith('D')) return 'text-orange-600 dark:text-orange-400 theme-pink:text-orange-600';
    if (letterGrade.startsWith('F')) return 'text-red-600 dark:text-red-400 theme-pink:text-red-500';
    
    return 'text-gray-600 dark:text-gray-400 theme-pink:text-gray-500';
  }
  
  // Function to format percentage for display
  export function formatPercentage(percentage: number | undefined): string {
    if (percentage === undefined || isNaN(percentage)) return 'N/A';
    return `${percentage.toFixed(1)}%`;
  }
  
 // Get GPA points from letter grade
export function getGpaPoints(letterGrade: string): number {
  switch (letterGrade.toUpperCase()) {
    case 'A+': return 4.0;
    case 'A': return 3.9;
    case 'A-': return 3.7;
    case 'B+': return 3.3;
    case 'B': return 3.0;
    case 'B-': return 2.7;
    case 'C+': return 2.3;
    case 'C': return 2.0;
    case 'C-': return 1.7;
    case 'D+': return 1.3;
    case 'D': return 1.0;
    case 'D-': return 0.7;
    case 'F': return 0.0;
    default: return NaN;
  }
}
  
  // Function to calculate GPA from percentage grades
  export function calculateGPAFromPercentages(records: { credits: number, gradePercentage?: number }[]): number {
    if (records.length === 0) return 0;
  
    let totalCredits = 0;
    let totalPoints = 0;
  
    for (const record of records) {
      // Skip records without grades
      if (record.gradePercentage === undefined) continue;
  
      // Convert percentage to letter grade
      const letterGrade = percentageToLetterGrade(record.gradePercentage);
      
      // Get GPA points for this letter grade
      const points = getGpaPoints(letterGrade);
  
      totalPoints += points * record.credits;
      totalCredits += record.credits;
    }
  
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }