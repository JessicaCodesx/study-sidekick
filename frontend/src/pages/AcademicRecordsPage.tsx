// AcademicRecordsPage.tsx - Web version with GPA tracking
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { AcademicRecord } from '../lib/types';
import { add, update, remove } from '../lib/db';
import { generateId, getCurrentTimestamp, formatDate } from '../lib/utils';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import GPAChart from '../components/academic-records/GPAChart';
import PercentageGradeInput from '../components/academic-records/PercentageGradeInput';
import { getGpaPoints } from '../lib/gradeUtils';

const AcademicRecordsPage = () => {
  const { state, dispatch } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AcademicRecord | null>(null);
  const [courseName, setCourseName] = useState('');
  const [term, setTerm] = useState('');
  const [credits, setCredits] = useState('');
  const [letterGrade, setLetterGrade] = useState('');
  const [gradePercentage, setGradePercentage] = useState('');
  const [notes, setNotes] = useState('');

  const calculateGPA = () => {
    if (state.academicRecords.length === 0) return '0.00';
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    state.academicRecords.forEach(record => {
      const points = getGpaPoints(record.letterGrade || '');
      totalPoints += points * record.credits;
      totalCredits += record.credits;
    });
    
    if (totalCredits === 0) return '0.00';
    return (totalPoints / totalCredits).toFixed(2);
  };

  const handleAddRecord = () => {
    setEditingRecord(null);
    setCourseName('');
    setTerm('');
    setCredits('');
    setLetterGrade('');
    setGradePercentage('');
    setNotes('');
    setShowModal(true);
  };

  const handleEditRecord = (record: AcademicRecord) => {
    setEditingRecord(record);
    setCourseName(record.name);
    setTerm(record.term);
    setCredits(record.credits.toString());
    setLetterGrade(record.letterGrade || '');
    setGradePercentage(record.gradePercentage?.toString() || '');
    setNotes(record.notes || '');
    setShowModal(true);
  };

  const handleSaveRecord = async () => {
    if (!courseName.trim() || !term.trim() || !credits.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const creditsNum = parseFloat(credits);
    if (isNaN(creditsNum) || creditsNum <= 0) {
      alert('Please enter a valid number of credits');
      return;
    }

    try {
      const now = getCurrentTimestamp();
      
      if (editingRecord) {
        const updatedRecord: AcademicRecord = {
          ...editingRecord,
          name: courseName,
          term,
          credits: creditsNum,
          letterGrade,
          gradePercentage: gradePercentage ? parseFloat(gradePercentage) : undefined,
          notes,
          updatedAt: now,
        };
        await update('academicRecords', updatedRecord);
        dispatch({ type: 'UPDATE_ACADEMIC_RECORD', payload: updatedRecord });
      } else {
        const newRecord: AcademicRecord = {
          id: generateId(),
          name: courseName,
          term,
          credits: creditsNum,
          letterGrade,
          gradePercentage: gradePercentage ? parseFloat(gradePercentage) : undefined,
          notes,
          createdAt: now,
          updatedAt: now,
        };
        await add('academicRecords', newRecord);
        dispatch({ type: 'ADD_ACADEMIC_RECORD', payload: newRecord });
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Failed to save academic record');
    }
  };

  const handleDeleteRecord = async (record: AcademicRecord) => {
    if (confirm(`Are you sure you want to delete "${record.name}"?`)) {
      try {
        await remove('academicRecords', record.id);
        dispatch({ type: 'DELETE_ACADEMIC_RECORD', payload: record.id });
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record');
      }
    }
  };

  const groupedByTerm = state.academicRecords.reduce((acc, record) => {
    if (!acc[record.term]) {
      acc[record.term] = [];
    }
    acc[record.term].push(record);
    return acc;
  }, {} as Record<string, AcademicRecord[]>);

  const overallGPA = calculateGPA();

  return (
    <div className="academic-records-container p-6 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-2">
            <span className="gradient-text">Academic Records</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your completed courses and GPA
          </p>
        </div>

        {/* GPA Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0">
            <CardContent className="text-center py-8">
              <p className="text-sm font-semibold text-white/90 mb-2">Overall GPA</p>
              <p className="text-6xl font-bold text-white mb-2">{overallGPA}</p>
              <p className="text-sm text-white/80">
                Based on {state.academicRecords.length} course{state.academicRecords.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* GPA Chart */}
        {state.academicRecords.length > 0 && (
          <div className="mb-8">
            <GPAChart records={state.academicRecords} />
          </div>
        )}

        {/* Add Record Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={handleAddRecord} variant="primary">
            + Add Academic Record
          </Button>
        </div>

        {/* Records by Term */}
        {Object.entries(groupedByTerm)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([term, records], termIndex) => (
            <motion.div
              key={term}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: termIndex * 0.1 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{term}</h2>
              <div className="space-y-4">
                {records.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{record.name}</h3>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                  {record.letterGrade || 'N/A'}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {record.credits} credits
                                </span>
                              </div>
                              {record.gradePercentage && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {record.gradePercentage.toFixed(1)}%
                                </span>
                              )}
                            </div>
                            {record.notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-2">
                                {record.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRecord(record)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteRecord(record)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

        {/* Empty State */}
        {state.academicRecords.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No academic records yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Add completed courses to track your GPA
              </p>
              <Button onClick={handleAddRecord} variant="primary">
                + Add Your First Record
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Record Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {editingRecord ? 'Edit Record' : 'New Academic Record'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Name *
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter course name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Term *
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., Fall 2024"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Credits *
                </label>
                <input
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="3"
                  min="0"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Letter Grade
                </label>
                <input
                  type="text"
                  value={letterGrade}
                  onChange={(e) => setLetterGrade(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="A, B, C..."
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grade Percentage (optional)
              </label>
              <input
                type="number"
                value={gradePercentage}
                onChange={(e) => setGradePercentage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="95.5"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveRecord}>
                Save Record
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AcademicRecordsPage;
