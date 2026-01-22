// AcademicRecordsPage.tsx - Full React Native version with GPA tracking
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Alert 
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { AcademicRecord } from '../lib/types';
import { add, update, remove } from '../lib/db';
import { generateId, getCurrentTimestamp } from '../lib/utils';

export default function AcademicRecordsPage() {
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
      const points = getGradePoints(record.letterGrade || '');
      totalPoints += points * record.credits;
      totalCredits += record.credits;
    });
    
    if (totalCredits === 0) return '0.00';
    return (totalPoints / totalCredits).toFixed(2);
  };

  const getGradePoints = (grade: string): number => {
    const gradeMap: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    return gradeMap[grade.toUpperCase()] || 0;
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
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const creditsNum = parseFloat(credits);
    if (isNaN(creditsNum) || creditsNum <= 0) {
      Alert.alert('Error', 'Please enter a valid number of credits');
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
      Alert.alert('Error', 'Failed to save academic record');
    }
  };

  const handleDeleteRecord = (record: AcademicRecord) => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete "${record.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove('academicRecords', record.id);
              dispatch({ type: 'DELETE_ACADEMIC_RECORD', payload: record.id });
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'Failed to delete record');
            }
          },
        },
      ]
    );
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
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Academic Records</Text>
          <Text style={styles.headerSubtitle}>
            Overall GPA: {overallGPA}
          </Text>
        </View>

        {/* GPA Summary */}
        <Card style={styles.gpaCard}>
          <Card.Content>
            <View style={styles.gpaContainer}>
              <Text style={styles.gpaLabel}>Overall GPA</Text>
              <Text style={styles.gpaValue}>{overallGPA}</Text>
              <Text style={styles.gpaSubtext}>
                Based on {state.academicRecords.length} course{state.academicRecords.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Records by Term */}
        {Object.entries(groupedByTerm).sort(([a], [b]) => b.localeCompare(a)).map(([term, records]) => (
          <View key={term}>
            <Text style={styles.termHeader}>{term}</Text>
            {records.map(record => (
              <Card key={record.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordName}>{record.name}</Text>
                      <View style={styles.recordMeta}>
                        <Text style={styles.recordGrade}>{record.letterGrade || 'N/A'}</Text>
                        <Text style={styles.recordCredits}>{record.credits} credits</Text>
                      </View>
                    </View>
                    <View style={styles.recordActions}>
                      <TouchableOpacity
                        onPress={() => handleEditRecord(record)}
                        style={styles.actionBtn}
                      >
                        <Text style={styles.actionText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteRecord(record)}
                        style={[styles.actionBtn, styles.deleteBtn]}
                      >
                        <Text style={[styles.actionText, styles.deleteText]}>Del</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {record.notes && (
                    <Text style={styles.recordNotes}>{record.notes}</Text>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        ))}

        {/* Empty State */}
        {state.academicRecords.length === 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.emptyText}>No academic records yet</Text>
              <Text style={styles.emptySubtext}>Add completed courses to track your GPA</Text>
            </Card.Content>
          </Card>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddRecord}>
          <Text style={styles.addButtonText}>+ Add Academic Record</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Record Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <ScrollView>
                <Text style={styles.modalTitle}>
                  {editingRecord ? 'Edit Record' : 'New Academic Record'}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Course Name"
                  value={courseName}
                  onChangeText={setCourseName}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Term (e.g., Fall 2024)"
                  value={term}
                  onChangeText={setTerm}
                />

                <View style={styles.row}>
                  <View style={[styles.input, styles.halfInput]}>
                    <TextInput
                      placeholder="Credits"
                      value={credits}
                      onChangeText={setCredits}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.input, styles.halfInput, { marginLeft: 8 }]}>
                    <TextInput
                      placeholder="Letter Grade (A, B, C...)"
                      value={letterGrade}
                      onChangeText={setLetterGrade}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Grade Percentage (optional)"
                  value={gradePercentage}
                  onChangeText={setGradePercentage}
                  keyboardType="numeric"
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Notes (optional)"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowModal(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSaveRecord}
                    style={styles.saveButton}
                    buttonColor="#7C3AED"
                  >
                    Save
                  </Button>
                </View>
              </ScrollView>
            </Card.Content>
          </Card>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  gpaCard: {
    margin: 15,
    backgroundColor: '#7C3AED',
  },
  gpaContainer: {
    alignItems: 'center',
  },
  gpaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  gpaValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  gpaSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  termHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  card: {
    margin: 15,
    marginBottom: 0,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  recordMeta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  recordGrade: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  recordCredits: {
    fontSize: 14,
    color: '#6B7280',
  },
  recordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
  },
  deleteText: {
    color: '#EF4444',
  },
  recordNotes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#7C3AED',
    margin: 15,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
