import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getAll, add, update, remove } from '../lib/db';
import { AcademicRecord } from '../lib/types';
import { generateId, getCurrentTimestamp, calculateGPA } from '../lib/utils';
import Button from '../components/common/Button';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import Modal, { ModalFooter } from '../components/common/Modal';
import GPAChart from '../components/academic-records/GPAChart';

const AcademicRecordsPage = () => {
  const { state, dispatch } = useAppContext();
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AcademicRecord[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [terms, setTerms] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<AcademicRecord | null>(null);
  const [gpa, setGpa] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load academic records
  useEffect(() => {
    const loadRecords = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // If records are already in state, use them
        if (state.academicRecords.length > 0) {
          setRecords(state.academicRecords);
        } else {
          // Otherwise, fetch from the database
          const allRecords = await getAll('academicRecords');
          setRecords(allRecords);
          
          // Also update the global state
          dispatch({ type: 'SET_ACADEMIC_RECORDS', payload: allRecords });
        }
        
        // Extract all unique terms
        const uniqueTerms = Array.from(new Set(records.map(record => record.term)));
        setTerms(uniqueTerms.sort().reverse()); // Sort by most recent term first
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading academic records:', err);
        setError('Failed to load academic records');
        setIsLoading(false);
      }
    };
    
    loadRecords();
  }, [state.academicRecords]);

  // Filter records and calculate GPA when term changes or records update
  useEffect(() => {
    if (selectedTerm === 'all') {
      setFilteredRecords(records);
      setGpa(calculateGPA(records));
    } else {
      const filtered = records.filter(record => record.term === selectedTerm);
      setFilteredRecords(filtered);
      setGpa(calculateGPA(filtered));
    }
  }, [selectedTerm, records]);

  // Handle adding a new record
  const handleAddRecord = async (recordData: {
    name: string;
    term: string;
    credits: number;
    grade?: string;
    notes?: string;
  }) => {
    try {
      setIsLoading(true);
      
      const now = getCurrentTimestamp();
      const newRecord: AcademicRecord = {
        id: generateId(),
        ...recordData,
        createdAt: now,
        updatedAt: now,
      };
      
      await add('academicRecords', newRecord);
      
      // Update local state
      const updatedRecords = [...records, newRecord];
      setRecords(updatedRecords);
      
      // Update global state
      dispatch({ type: 'ADD_ACADEMIC_RECORD', payload: newRecord });
      
      // Update terms if new term
      if (!terms.includes(newRecord.term)) {
        setTerms([...terms, newRecord.term].sort().reverse());
      }
      
      setIsAddModalOpen(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Error adding academic record:', err);
      setError('Failed to add academic record');
      setIsLoading(false);
    }
  };

  // Handle updating a record
  const handleUpdateRecord = async (recordData: {
    name: string;
    term: string;
    credits: number;
    grade?: string;
    notes?: string;
  }) => {
    if (!currentRecord) return;
    
    try {
      setIsLoading(true);
      
      const updatedRecord: AcademicRecord = {
        ...currentRecord,
        ...recordData,
        updatedAt: getCurrentTimestamp(),
      };
      
      await update('academicRecords', updatedRecord);
      
      // Update local state
      const updatedRecords = records.map(record => 
        record.id === updatedRecord.id ? updatedRecord : record
      );
      setRecords(updatedRecords);
      
      // Update global state
      dispatch({ type: 'UPDATE_ACADEMIC_RECORD', payload: updatedRecord });
      
      // Update terms if new term
      if (!terms.includes(updatedRecord.term)) {
        setTerms([...terms, updatedRecord.term].sort().reverse());
      }
      
      setIsEditModalOpen(false);
      setCurrentRecord(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error updating academic record:', err);
      setError('Failed to update academic record');
      setIsLoading(false);
    }
  };

  // Handle deleting a record
  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('Are you sure you want to delete this academic record?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      await remove('academicRecords', recordId);
      
      // Update local state
      const updatedRecords = records.filter(record => record.id !== recordId);
      setRecords(updatedRecords);
      
      // Update global state
      dispatch({ type: 'DELETE_ACADEMIC_RECORD', payload: recordId });
      
      // Re-calculate terms
      const uniqueTerms = Array.from(new Set(updatedRecords.map(record => record.term)));
      setTerms(uniqueTerms.sort().reverse());
      
      if (currentRecord && currentRecord.id === recordId) {
        setCurrentRecord(null);
        setIsEditModalOpen(false);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error deleting academic record:', err);
      setError('Failed to delete academic record');
      setIsLoading(false);
    }
  };

  // Get letter grade color
  const getGradeColor = (grade: string | undefined) => {
    if (!grade) return 'text-gray-600 dark:text-gray-400';
    
    const gradeValue = grade.toUpperCase();
    
    if (gradeValue.startsWith('A')) return 'text-green-600 dark:text-green-400';
    if (gradeValue.startsWith('B')) return 'text-blue-600 dark:text-blue-400';
    if (gradeValue.startsWith('C')) return 'text-yellow-600 dark:text-yellow-400';
    if (gradeValue.startsWith('D')) return 'text-orange-600 dark:text-orange-400';
    if (gradeValue.startsWith('F')) return 'text-red-600 dark:text-red-400';
    
    return 'text-gray-600 dark:text-gray-400';
  };

  // Format GPA for display
  const formatGPA = (gpa: number) => {
    return gpa.toFixed(2);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Records</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your courses, grades, and GPA
          </p>
        </div>
        
        <div className="mt-3 md:mt-0">
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Course Record
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* GPA Card */}
        <Card className="lg:col-span-1">
          <CardTitle>GPA</CardTitle>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {formatGPA(gpa)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedTerm === 'all' ? 'Cumulative GPA' : `${selectedTerm} GPA`}
              </p>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">0.0</span>
                  <span className="text-gray-600 dark:text-gray-400">4.0</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full"
                    style={{ width: `${(gpa / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Credits: {filteredRecords.reduce((sum, record) => sum + record.credits, 0)}</p>
                <p>Courses: {filteredRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Academic Records */}
        <div className="lg:col-span-3">
          <Card>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center">
              <CardTitle className="mb-0">Course History</CardTitle>
              
              <div className="flex items-center mt-2 md:mt-0">
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Term:</span>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Terms</option>
                  {terms.map(term => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <CardContent>
              {isLoading && records.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading records...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No Course Records
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {selectedTerm === 'all'
                      ? "You haven't added any course records yet."
                      : `No courses found for ${selectedTerm}.`}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Add Your First Course Record
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Course
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Term
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Credits
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Grade
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredRecords.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {record.name}
                            </div>
                            {record.notes && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate">
                                {record.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {record.term}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {record.credits}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className={`text-sm font-medium ${getGradeColor(record.grade)}`}>
                              {record.grade || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setCurrentRecord(record);
                                setIsEditModalOpen(true);
                              }}
                              className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* GPA Chart Component */}
      <Card className="mb-6">
        <CardTitle>GPA Trends</CardTitle>
        <CardContent className="h-80">
          <GPAChart academicRecords={records} />
        </CardContent>
      </Card>
      
      {/* Add Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Course Record"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Course Name *
            </label>
            <input
              type="text"
              id="courseName"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Introduction to Computer Science"
            />
          </div>
          
          <div>
            <label htmlFor="courseTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Term *
            </label>
            <input
              type="text"
              id="courseTerm"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Fall 2024"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="courseCredits" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Credits *
              </label>
              <input
                type="number"
                id="courseCredits"
                min="0"
                step="0.5"
                defaultValue="3"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="courseGrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Grade
              </label>
              <select
                id="courseGrade"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Select Grade</option>
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B">B</option>
                <option value="B-">B-</option>
                <option value="C+">C+</option>
                <option value="C">C</option>
                <option value="C-">C-</option>
                <option value="D+">D+</option>
                <option value="D">D</option>
                <option value="D-">D-</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="courseNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (Optional)
            </label>
            <textarea
              id="courseNotes"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Any comments or reflections about this course..."
            ></textarea>
          </div>
        </div>
        
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const nameInput = document.getElementById('courseName') as HTMLInputElement;
              const termInput = document.getElementById('courseTerm') as HTMLInputElement;
              const creditsInput = document.getElementById('courseCredits') as HTMLInputElement;
              const gradeSelect = document.getElementById('courseGrade') as HTMLSelectElement;
              const notesTextarea = document.getElementById('courseNotes') as HTMLTextAreaElement;
              
              if (
                nameInput && 
                termInput && 
                creditsInput && 
                nameInput.value.trim() && 
                termInput.value.trim() && 
                creditsInput.value
              ) {
                handleAddRecord({
                  name: nameInput.value.trim(),
                  term: termInput.value.trim(),
                  credits: parseFloat(creditsInput.value),
                  grade: gradeSelect.value || undefined,
                  notes: notesTextarea.value.trim() || undefined,
                });
              }
            }}
          >
            Add Record
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Edit Record Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCurrentRecord(null);
        }}
        title="Edit Course Record"
      >
        {currentRecord && (
          <div className="space-y-4">
            <div>
              <label htmlFor="editCourseName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Course Name *
              </label>
              <input
                type="text"
                id="editCourseName"
                defaultValue={currentRecord.name}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="editCourseTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Term *
              </label>
              <input
                type="text"
                id="editCourseTerm"
                defaultValue={currentRecord.term}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="editCourseCredits" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Credits *
                </label>
                <input
                  type="number"
                  id="editCourseCredits"
                  min="0"
                  step="0.5"
                  defaultValue={currentRecord.credits}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="editCourseGrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grade
                </label>
                <select
                  id="editCourseGrade"
                  defaultValue={currentRecord.grade || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Select Grade</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B-">B-</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="C-">C-</option>
                  <option value="D+">D+</option>
                  <option value="D">D</option>
                  <option value="D-">D-</option>
                  <option value="F">F</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="editCourseNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes (Optional)
              </label>
              <textarea
                id="editCourseNotes"
                rows={3}
                defaultValue={currentRecord.notes || ''}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              ></textarea>
            </div>
          </div>
        )}
        
        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsEditModalOpen(false);
              setCurrentRecord(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const nameInput = document.getElementById('editCourseName') as HTMLInputElement;
              const termInput = document.getElementById('editCourseTerm') as HTMLInputElement;
              const creditsInput = document.getElementById('editCourseCredits') as HTMLInputElement;
              const gradeSelect = document.getElementById('editCourseGrade') as HTMLSelectElement;
              const notesTextarea = document.getElementById('editCourseNotes') as HTMLTextAreaElement;
              
              if (
                nameInput && 
                termInput && 
                creditsInput && 
                nameInput.value.trim() && 
                termInput.value.trim() && 
                creditsInput.value
              ) {
                handleUpdateRecord({
                  name: nameInput.value.trim(),
                  term: termInput.value.trim(),
                  credits: parseFloat(creditsInput.value),
                  grade: gradeSelect.value || undefined,
                  notes: notesTextarea.value.trim() || undefined,
                });
              }
            }}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AcademicRecordsPage;