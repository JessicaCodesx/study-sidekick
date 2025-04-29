import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AcademicRecord } from '../../lib/types';
import { calculateGPA } from '../../lib/utils';

interface GPAChartProps {
  academicRecords: AcademicRecord[];
}

const GPAChart = ({ academicRecords }: GPAChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [cumulative, setCumulative] = useState(true);

  useEffect(() => {
    prepareChartData();
  }, [academicRecords, cumulative]);

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
      const termGPA = calculateGPA(termRecords);
      
      // Add to cumulative records list
      allRecordsSoFar = [...allRecordsSoFar, ...termRecords];
      const cumulativeGPA = calculateGPA(allRecordsSoFar);
      
      data.push({
        term,
        termGPA: parseFloat(termGPA.toFixed(2)),
        cumulativeGPA: parseFloat(cumulativeGPA.toFixed(2)),
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
          <p className="text-blue-600 dark:text-blue-400">
            Term GPA: {payload[0].payload.termGPA.toFixed(2)}
          </p>
          <p className="text-purple-600 dark:text-purple-400">
            Cumulative GPA: {payload[0].payload.cumulativeGPA.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">GPA Trends</h3>
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
                domain={[0, 4]} 
                ticks={[0, 1, 2, 3, 4]} 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {!cumulative && (
                <Line
                  type="monotone"
                  dataKey="termGPA"
                  name="Term GPA"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              )}
              
              <Line
                type="monotone"
                dataKey="cumulativeGPA"
                name="Cumulative GPA"
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