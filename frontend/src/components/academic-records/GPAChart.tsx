import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AcademicRecord } from '../../lib/types';
import { calculateGPAFromPercentages } from '../../lib/gradeUtils';

interface GPAChartProps {
  academicRecords: AcademicRecord[];
}

// Helper to convert letter grade to approximate percentage
// Moved outside the component to avoid using it before definition
const letterGradeToApproxPercentage = (letterGrade: string): number => {
  const gradeMap: Record<string, number> = {
    'A+': 97, 'A': 94, 'A-': 90,
    'B+': 87, 'B': 84, 'B-': 80,
    'C+': 77, 'C': 74, 'C-': 70,
    'D+': 67, 'D': 64, 'D-': 60,
    'F': 55
  };
  
  return gradeMap[letterGrade.toUpperCase()] || 0;
};

const GPAChart = ({ academicRecords }: GPAChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [cumulative, setCumulative] = useState(true);
  const [displayMode, setDisplayMode] = useState<'gpa' | 'percentage'>('gpa');

  useEffect(() => {
    prepareChartData();
  }, [academicRecords, cumulative, displayMode]);

  const prepareChartData = () => {
    if (!academicRecords || academicRecords.length === 0) {
      setChartData([]);
      return;
    }

    // Group records by term
    const termGroups: Record<string, AcademicRecord[]> = {};
    academicRecords.forEach(record => {
      if (!termGroups[record.term]) {
        termGroups[record.term] = [];
      }
      termGroups[record.term].push(record);
    });

    // Sort terms chronologically (assuming format like "Fall 2023")
    const sortedTerms = Object.keys(termGroups).sort((a, b) => {
      // Extract year and season
      const aMatch = a.match(/(\w+)\s+(\d+)/);
      const bMatch = b.match(/(\w+)\s+(\d+)/);
      
      if (!aMatch || !bMatch) return 0;
      
      const [, aSeason, aYear] = aMatch;
      const [, bSeason, bYear] = bMatch;
      
      // Compare years first
      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear);
      }
      
      // If same year, compare seasons
      const seasonOrder: Record<string, number> = {
        'Winter': 0,
        'Spring': 1,
        'Summer': 2,
        'Fall': 3
      };
      
      return (seasonOrder[aSeason] || 0) - (seasonOrder[bSeason] || 0);
    });

    // Calculate GPA for each term
    const data = [];
    let allRecordsSoFar: AcademicRecord[] = [];
    
    sortedTerms.forEach(term => {
      const termRecords = termGroups[term];
      const termGPA = calculateGPAFromPercentages(termRecords);
      
      // Calculate average percentage for the term
      const termPercentageTotal = termRecords.reduce((sum, record) => {
        // If we have a percentage grade, use that
        if (record.gradePercentage !== undefined) {
          return sum + (record.gradePercentage * record.credits);
        }
        // Otherwise try to convert letter grade to approximate percentage
        else if (record.letterGrade) {
          const approxPercentage = letterGradeToApproxPercentage(record.letterGrade);
          return sum + (approxPercentage * record.credits);
        }
        return sum;
      }, 0);
      
      const totalTermCredits = termRecords.reduce((sum, record) => sum + record.credits, 0);
      const termPercentage = totalTermCredits > 0 ? termPercentageTotal / totalTermCredits : 0;
      
      // Add to cumulative records list
      allRecordsSoFar = [...allRecordsSoFar, ...termRecords];
      const cumulativeGPA = calculateGPAFromPercentages(allRecordsSoFar);
      
      // Calculate cumulative percentage
      const cumulativePercentageTotal = allRecordsSoFar.reduce((sum, record) => {
        if (record.gradePercentage !== undefined) {
          return sum + (record.gradePercentage * record.credits);
        }
        else if (record.letterGrade) {
          const approxPercentage = letterGradeToApproxPercentage(record.letterGrade);
          return sum + (approxPercentage * record.credits);
        }
        return sum;
      }, 0);
      
      const totalCumulativeCredits = allRecordsSoFar.reduce((sum, record) => sum + record.credits, 0);
      const cumulativePercentage = totalCumulativeCredits > 0 ? cumulativePercentageTotal / totalCumulativeCredits : 0;
      
      data.push({
        term,
        termGPA: parseFloat(termGPA.toFixed(2)),
        cumulativeGPA: parseFloat(cumulativeGPA.toFixed(2)),
        termPercentage: parseFloat(termPercentage.toFixed(1)),
        cumulativePercentage: parseFloat(cumulativePercentage.toFixed(1)),
        credits: termRecords.reduce((sum, record) => sum + record.credits, 0),
        courses: termRecords.length
      });
    });
    
    setChartData(data);
  };

  // Custom tooltip for hover information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="font-medium text-gray-800 dark:text-gray-200">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Courses: {payload[0].payload.courses}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Credits: {payload[0].payload.credits}
          </p>
          
          {/* Show GPA or Percentage based on display mode */}
          {displayMode === 'gpa' ? (
            <>
              {!cumulative && (
                <p className="text-blue-600 dark:text-blue-400">
                  Term GPA: {payload[0].payload.termGPA.toFixed(2)}
                </p>
              )}
              <p className="text-purple-600 dark:text-purple-400">
                Cumulative GPA: {payload[0].payload.cumulativeGPA.toFixed(2)}
              </p>
            </>
          ) : (
            <>
              {!cumulative && (
                <p className="text-blue-600 dark:text-blue-400">
                  Term Average: {payload[0].payload.termPercentage.toFixed(1)}%
                </p>
              )}
              <p className="text-purple-600 dark:text-purple-400">
                Cumulative Average: {payload[0].payload.cumulativePercentage.toFixed(1)}%
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">GPA Trends</h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setDisplayMode('gpa')}
            className={`px-3 py-1 text-sm rounded-full ${
              displayMode === 'gpa' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            GPA (4.0)
          </button>
          <button
            onClick={() => setDisplayMode('percentage')}
            className={`px-3 py-1 text-sm rounded-full ${
              displayMode === 'percentage' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            Percentage
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setCumulative(true)}
            className={`px-3 py-1 text-sm rounded-full ${
              cumulative 
                ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            Cumulative
          </button>
          <button
            onClick={() => setCumulative(false)}
            className={`px-3 py-1 text-sm rounded-full ${
              !cumulative 
                ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            Term by Term
          </button>
        </div>
      </div>
      
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            Add courses to your academic record to see GPA trends
          </p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis 
                dataKey="term" 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af" 
              />
              <YAxis 
                domain={displayMode === 'gpa' ? [0, 4] : [0, 100]} 
                ticks={displayMode === 'gpa' ? [0, 1, 2, 3, 4] : [0, 20, 40, 60, 80, 100]} 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                label={{ 
                  value: displayMode === 'gpa' ? 'GPA' : 'Percentage', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#9ca3af', fontSize: 12 } 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {!cumulative && (
                <Line
                  type="monotone"
                  dataKey={displayMode === 'gpa' ? "termGPA" : "termPercentage"}
                  name={displayMode === 'gpa' ? "Term GPA" : "Term Average"}
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              )}
              
              <Line
                type="monotone"
                dataKey={displayMode === 'gpa' ? "cumulativeGPA" : "cumulativePercentage"}
                name={displayMode === 'gpa' ? "Cumulative GPA" : "Cumulative Average"}
                stroke="#8b5cf6"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default GPAChart;