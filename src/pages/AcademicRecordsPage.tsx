import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getAll, add, update, remove } from '../lib/db';
import { AcademicRecord } from '../lib/types';
import { 
  generateId, 
  getCurrentTimestamp 
} from '../lib/utils';
import {
  getGradeColor,
  formatPercentage,
  percentageToLetterGrade,
  calculateGPAFromPercentages
} from '../lib/gradeUtils';
import Button from '../components/common/Button';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import Modal, { ModalFooter } from '../components/common/Modal';
import PercentageGradeInput from '../components/academic-records/PercentageGradeInput';
import GPAChart from '../components/academic-records/GPAChart';
import PageContainer from '../components/layout/PageContainer';
import { motion } from 'framer-motion'; 

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

  // Form state for adding/editing records
  const [newGradePercentage, setNewGradePercentage] = useState<number | undefined>(undefined);
  const [newLetterGrade, setNewLetterGrade] = useState<string | undefined>(undefined);

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
      setGpa(calculateGPAFromPercentages(records));
    } else {
      const filtered = records.filter(record => record.term === selectedTerm);
      setFilteredRecords(filtered);
      setGpa(calculateGPAFromPercentages(filtered));
    }
  }, [selectedTerm, records]);

  // Reset form state when modals open/close
  useEffect(() => {
    if (isAddModalOpen) {
      setNewGradePercentage(undefined);
      setNewLetterGrade(undefined);
    }
  }, [isAddModalOpen]);

  useEffect(() => {
    if (isEditModalOpen && currentRecord) {
      setNewGradePercentage(currentRecord.gradePercentage);
      setNewLetterGrade(currentRecord.letterGrade);
    }
  }, [isEditModalOpen, currentRecord]);

  // Handle adding a new record
  const handleAddRecord = async (recordData: {
    name: string;
    term: string;
    credits: number;
    gradePercentage?: number;
    letterGrade?: string;
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
        grade: ''
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
    gradePercentage?: number;
    letterGrade?: string;
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

  // Handle grade change
  const handleGradeChange = (percentage: number | undefined, letterGrade: string | undefined) => {
    setNewGradePercentage(percentage);
    setNewLetterGrade(letterGrade);
  };

  // Format GPA for display
  const formatGPA = (gpa: number) => {
    return gpa.toFixed(2);
  };
  return (
    <PageContainer>
      {/* Animated Header Section */}
      <motion.div
        className="mb-8 mt-6 p-6 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-700 theme-pink:from-pink-50 theme-pink:to-pink-100 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white theme-pink:text-pink-600">
              Academic Records
            </h1>
            <p className="text-gray-600 dark:text-gray-300 theme-pink:text-pink-500 mt-1">
              Track your courses, grades, and GPA
            </p>
          </motion.div>
  
          <motion.div
            className="mt-3 md:mt-0 flex space-x-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Course Record
            </Button>
          </motion.div>
        </div>
      </motion.div>
  
      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded theme-pink:bg-pink-100 theme-pink:text-red-600">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* GPA Card */}
        <Card className="lg:col-span-1">
          <CardTitle>GPA</CardTitle>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 theme-pink:text-pink-500 mb-2">
                {formatGPA(gpa)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-400">
                {selectedTerm === 'all' ? 'Cumulative GPA' : `${selectedTerm} GPA`}
              </p>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400 theme-pink:text-pink-400">0.0</span>
                  <span className="text-gray-600 dark:text-gray-400 theme-pink:text-pink-400">4.0</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 theme-pink:bg-pink-100 rounded-full h-2.5">
                  <div
                    className="bg-primary-600 dark:bg-primary-500 theme-pink:bg-pink-400 h-2.5 rounded-full"
                    style={{ width: `${(gpa / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-400">
                <p>Credits: {filteredRecords.reduce((sum, record) => sum + record.credits, 0)}</p>
                <p>Courses: {filteredRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Academic Records */}
        <div className="lg:col-span-3">
          <Card>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 theme-pink:border-pink-200 flex flex-wrap justify-between items-center">
              <CardTitle className="mb-0">Course History</CardTitle>
              
              <div className="flex items-center mt-2 md:mt-0">
                <span className="text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-500 mr-2">Term:</span>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 theme-pink:bg-white shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 text-sm"
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
                  <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent theme-pink:border-pink-400 theme-pink:border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">Loading records...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white theme-pink:text-pink-600">
                    No Course Records
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 theme-pink:text-pink-500">
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
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 theme-pink:divide-pink-200">
                    <thead className="bg-gray-50 dark:bg-gray-800 theme-pink:bg-pink-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-600 uppercase tracking-wider">
                          Course
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-600 uppercase tracking-wider">
                          Term
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-600 uppercase tracking-wider">
                          Credits
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-600 uppercase tracking-wider">
                          Grade
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 theme-pink:text-pink-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 theme-pink:bg-white divide-y divide-gray-200 dark:divide-gray-700 theme-pink:divide-pink-100">
                      {filteredRecords.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white theme-pink:text-gray-800">
                              {record.name}
                            </div>
                            {record.notes && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 theme-pink:text-pink-500 mt-1 max-w-xs truncate">
                                {record.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white theme-pink:text-gray-800">
                              {record.term}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white theme-pink:text-gray-800">
                              {record.credits}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col">
                              {record.gradePercentage !== undefined && (
                                <span className="text-sm text-gray-600 dark:text-gray-400 theme-pink:text-gray-700">
                                  {formatPercentage(record.gradePercentage)}
                                </span>
                              )}
                              {record.letterGrade && (
                                <span className={`text-sm font-medium ${getGradeColor(record.letterGrade)}`}>
                                  {record.letterGrade}
                                </span>
                              )}
                              {!record.gradePercentage && !record.letterGrade && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 theme-pink:text-gray-500">
                                  N/A
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setCurrentRecord(record);
                                setIsEditModalOpen(true);
                              }}
                              className="text-primary-600 dark:text-primary-400 theme-pink:text-pink-500 hover:text-primary-800 dark:hover:text-primary-300 theme-pink:hover:text-pink-700 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-red-600 dark:text-red-400 theme-pink:text-red-500 hover:text-red-800 dark:hover:text-red-300 theme-pink:hover:text-red-700"
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
            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
              Course Name *
            </label>
            <input
              type="text"
              id="courseName"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              placeholder="Introduction to Computer Science"
            />
          </div>
          
          <div>
            <label htmlFor="courseTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
              Term *
            </label>
            <input
              type="text"
              id="courseTerm"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              placeholder="Fall 2024"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="courseCredits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Credits *
              </label>
              <input
                type="number"
                id="courseCredits"
                min="0"
                step="0.5"
                defaultValue="3"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="courseGrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Grade (%)
              </label>
              <PercentageGradeInput 
                onChange={handleGradeChange}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="courseNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
              Notes (Optional)
            </label>
            <textarea
              id="courseNotes"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
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
                  gradePercentage: newGradePercentage,
                  letterGrade: newLetterGrade,
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
              <label htmlFor="editCourseName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Course Name *
              </label>
              <input
                type="text"
                id="editCourseName"
                defaultValue={currentRecord.name}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="editCourseTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Term *
              </label>
              <input
                type="text"
                id="editCourseTerm"
                defaultValue={currentRecord.term}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="editCourseCredits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                  Credits *
                </label>
                <input
                  type="number"
                  id="editCourseCredits"
                  min="0"
                  step="0.5"
                  defaultValue={currentRecord.credits}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="editCourseGrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                  Grade (%)
                </label>
                <PercentageGradeInput 
                  initialValue={currentRecord.gradePercentage}
                  onChange={handleGradeChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="editCourseNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Notes (Optional)
              </label>
              <textarea
                id="editCourseNotes"
                rows={3}
                defaultValue={currentRecord.notes || ''}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
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
                  gradePercentage: newGradePercentage,
                  letterGrade: newLetterGrade,
                  notes: notesTextarea.value.trim() || undefined,
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

export default AcademicRecordsPage;