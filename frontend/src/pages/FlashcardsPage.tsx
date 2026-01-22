// FlashcardsPage.tsx - Full React Native version with flip animation
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Alert,
  Animated 
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { Flashcard, Course } from '../lib/types';
import { add, update, remove } from '../lib/db';
import { generateId, getCurrentTimestamp } from '../lib/utils';

export default function FlashcardsPage() {
  const { state, dispatch } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const flipAnimation = useState(new Animated.Value(0))[0];

  const handleAddFlashcard = () => {
    setEditingFlashcard(null);
    setQuestion('');
    setAnswer('');
    setSelectedCourse('');
    setShowModal(true);
  };

  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setQuestion(flashcard.question);
    setAnswer(flashcard.answer);
    setSelectedCourse(flashcard.courseId);
    setShowModal(true);
  };

  const handleSaveFlashcard = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert('Error', 'Please enter both question and answer');
      return;
    }

    if (!selectedCourse) {
      Alert.alert('Error', 'Please select a course');
      return;
    }

    try {
      const now = getCurrentTimestamp();
      
      if (editingFlashcard) {
        const updatedFlashcard: Flashcard = {
          ...editingFlashcard,
          question,
          answer,
          updatedAt: now,
        };
        await update('flashcards', updatedFlashcard);
        dispatch({ type: 'UPDATE_FLASHCARD', payload: updatedFlashcard });
      } else {
        const newFlashcard: Flashcard = {
          id: generateId(),
          question,
          answer,
          courseId: selectedCourse,
          unitId: '',
          reviewCount: 0,
          confidenceLevel: 1,
          createdAt: now,
          updatedAt: now,
        };
        await add('flashcards', newFlashcard);
        dispatch({ type: 'ADD_FLASHCARD', payload: newFlashcard });
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving flashcard:', error);
      Alert.alert('Error', 'Failed to save flashcard');
    }
  };

  const handleDeleteFlashcard = (flashcard: Flashcard) => {
    Alert.alert(
      'Delete Flashcard',
      'Are you sure you want to delete this flashcard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove('flashcards', flashcard.id);
              dispatch({ type: 'DELETE_FLASHCARD', payload: flashcard.id });
            } catch (error) {
              console.error('Error deleting flashcard:', error);
              Alert.alert('Error', 'Failed to delete flashcard');
            }
          },
        },
      ]
    );
  };

  const handleStartStudy = () => {
    if (state.flashcards.length === 0) {
      Alert.alert('No Flashcards', 'Please create some flashcards first');
      return;
    }
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowStudyMode(true);
  };

  const flipCard = () => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCardIndex < state.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      flipAnimation.setValue(0);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      flipAnimation.setValue(0);
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const courses = state.courses.filter(c => !c.isArchived);

  if (showStudyMode && state.flashcards.length > 0) {
    const currentCard = state.flashcards[currentCardIndex];
    const course = state.courses.find(c => c.id === currentCard.courseId);

    return (
      <View style={styles.studyContainer}>
        {/* Header */}
        <View style={styles.studyHeader}>
          <TouchableOpacity onPress={() => setShowStudyMode(false)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.studyProgress}>
            {currentCardIndex + 1} / {state.flashcards.length}
          </Text>
        </View>

        {/* Card */}
        <TouchableOpacity style={styles.flipCardContainer} onPress={flipCard} activeOpacity={0.9}>
          <Animated.View style={[
            styles.flipCard,
            { transform: [{ rotateY: frontInterpolate }] },
            isFlipped && { opacity: 0 }
          ]}>
            <Card style={[styles.flipCardInner, { backgroundColor: course?.colorTheme || '#7C3AED' }]}>
              <Card.Content>
                <Text style={styles.flipLabel}>Question</Text>
                <Text style={styles.flipText}>{currentCard.question}</Text>
                <Text style={styles.flipHint}>Tap to reveal answer</Text>
              </Card.Content>
            </Card>
          </Animated.View>

          <Animated.View style={[
            styles.flipCard,
            { transform: [{ rotateY: backInterpolate }] },
            !isFlipped && { opacity: 0 }
          ]}>
            <Card style={[styles.flipCardInner, { backgroundColor: '#10B981' }]}>
              <Card.Content>
                <Text style={styles.flipLabel}>Answer</Text>
                <Text style={styles.flipText}>{currentCard.answer}</Text>
              </Card.Content>
            </Card>
          </Animated.View>
        </TouchableOpacity>

        {/* Controls */}
        <View style={styles.studyControls}>
          <TouchableOpacity
            onPress={handlePrevious}
            style={[styles.navButton, currentCardIndex === 0 && styles.navButtonDisabled]}
            disabled={currentCardIndex === 0}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.navButton, currentCardIndex === state.flashcards.length - 1 && styles.navButtonDisabled]}
            disabled={currentCardIndex === state.flashcards.length - 1}
          >
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Flashcards</Text>
          <Text style={styles.headerSubtitle}>
            {state.flashcards.length} flashcards
          </Text>
        </View>

        {/* Study Mode Button */}
        {state.flashcards.length > 0 && (
          <TouchableOpacity style={styles.studyButton} onPress={handleStartStudy}>
            <Text style={styles.studyButtonText}>🎓 Start Studying</Text>
          </TouchableOpacity>
        )}

        {/* Flashcards List */}
        {state.flashcards.length > 0 ? (
          state.flashcards.map(flashcard => {
            const course = state.courses.find(c => c.id === flashcard.courseId);
            return (
              <Card key={flashcard.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.flashcardHeader}>
                    <View style={[styles.colorBadge, { backgroundColor: course?.colorTheme || '#7C3AED' }]}>
                      <Text style={styles.colorBadgeText}>{course?.name || 'No Course'}</Text>
                    </View>
                    <View style={styles.flashcardActions}>
                      <TouchableOpacity onPress={() => handleEditFlashcard(flashcard)} style={styles.actionBtn}>
                        <Text style={styles.actionText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteFlashcard(flashcard)} style={[styles.actionBtn, styles.deleteBtn]}>
                        <Text style={[styles.actionText, styles.deleteText]}>Del</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.questionText}>Q: {flashcard.question}</Text>
                  <Text style={styles.answerText}>A: {flashcard.answer}</Text>
                  <Text style={styles.studyInfo}>
                    Reviewed {flashcard.reviewCount} times
                  </Text>
                </Card.Content>
              </Card>
            );
          })
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.emptyText}>No flashcards yet</Text>
              <Text style={styles.emptySubtext}>Create flashcards to study</Text>
            </Card.Content>
          </Card>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddFlashcard}>
          <Text style={styles.addButtonText}>+ Add Flashcard</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Flashcard Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <ScrollView>
                <Text style={styles.modalTitle}>
                  {editingFlashcard ? 'Edit Flashcard' : 'New Flashcard'}
                </Text>
                
                {/* Course Selection */}
                {courses.length > 0 && (
                  <View style={styles.selectedCourse}>
                    {editingFlashcard && (
                      <Text style={styles.label}>Course</Text>
                    )}
                    {courses.map(course => (
                      <TouchableOpacity
                        key={course.id}
                        style={[
                          styles.courseOption,
                          selectedCourse === course.id && styles.courseOptionSelected
                        ]}
                        onPress={() => setSelectedCourse(course.id)}
                      >
                        <View style={[styles.courseDot, { backgroundColor: course.colorTheme || '#7C3AED' }]} />
                        <Text style={[
                          styles.courseOptionText,
                          selectedCourse === course.id && styles.courseOptionTextSelected
                        ]}>
                          {course.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Question"
                  value={question}
                  onChangeText={setQuestion}
                />
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Answer"
                  value={answer}
                  onChangeText={setAnswer}
                  multiline
                  numberOfLines={5}
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
                    onPress={handleSaveFlashcard}
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
  studyButton: {
    backgroundColor: '#10B981',
    margin: 15,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  studyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    margin: 15,
    marginBottom: 0,
  },
  flashcardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  colorBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  flashcardActions: {
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
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  studyInfo: {
    fontSize: 12,
    color: '#9CA3AF',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  selectedCourse: {
    marginBottom: 16,
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    width: '100%',
    marginBottom: 8,
  },
  courseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  courseOptionSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F4F6',
  },
  courseOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  courseOptionTextSelected: {
    color: '#7C3AED',
  },
  courseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  textArea: {
    height: 150,
    textAlignVertical: 'top',
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
  // Study Mode Styles
  studyContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  studyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  studyProgress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  flipCardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  flipCard: {
    width: '100%',
    height: 400,
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  flipCardInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  flipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    textAlign: 'center',
  },
  flipText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  flipHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 20,
  },
  studyControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  navButtonDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
