// NotesPage.tsx - Full React Native version with CRUD operations
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Alert,
  FlatList 
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { Note, Course } from '../lib/types';
import { add, update, remove, getNotesByCourse } from '../lib/db';
import { generateId, getCurrentTimestamp } from '../lib/utils';

export default function NotesPage() {
  const { state, dispatch } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setSelectedCourse('');
    setShowModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setSelectedCourse(note.courseId);
    setShowModal(true);
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      Alert.alert('Error', 'Please enter a note title');
      return;
    }

    if (!selectedCourse) {
      Alert.alert('Error', 'Please select a course');
      return;
    }

    try {
      const now = getCurrentTimestamp();
      
      if (editingNote) {
        const updatedNote: Note = {
          ...editingNote,
          title: noteTitle,
          content: noteContent,
          updatedAt: now,
        };
        await update('notes', updatedNote);
        dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
      } else {
        const newNote: Note = {
          id: generateId(),
          title: noteTitle,
          content: noteContent,
          courseId: selectedCourse,
          unitId: '', // Could add unit selection later
          createdAt: now,
          updatedAt: now,
        };
        await add('notes', newNote);
        dispatch({ type: 'ADD_NOTE', payload: newNote });
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove('notes', note.id);
              dispatch({ type: 'DELETE_NOTE', payload: note.id });
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const renderNoteCard = (note: Note) => {
    const course = state.courses.find(c => c.id === note.courseId);
    
    return (
      <Card key={note.id} style={styles.card}>
        <Card.Content>
          <View style={styles.noteHeader}>
            <View style={styles.noteInfo}>
              {course && (
                <View style={[styles.courseBadge, { backgroundColor: course.colorTheme || '#7C3AED' }]}>
                  <Text style={styles.courseBadgeText}>{course.name}</Text>
                </View>
              )}
              <Text style={styles.noteTitle}>{note.title}</Text>
            </View>
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => handleEditNote(note)} style={styles.actionBtn}>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteNote(note)} style={[styles.actionBtn, styles.deleteBtn]}>
                <Text style={[styles.actionText, styles.deleteText]}>Del</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.noteContent} numberOfLines={3}>
            {note.content || 'No content'}
          </Text>
          <Text style={styles.noteDate}>
            {new Date(note.updatedAt).toLocaleDateString()}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  const courses = state.courses.filter(c => !c.isArchived);

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notes</Text>
          <Text style={styles.headerSubtitle}>
            {state.notes.length} notes
          </Text>
        </View>

        {/* Notes List */}
        {state.notes.length > 0 ? (
          state.notes.map(renderNoteCard)
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.emptyText}>No notes yet</Text>
              <Text style={styles.emptySubtext}>Create notes for your courses</Text>
            </Card.Content>
          </Card>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
          <Text style={styles.addButtonText}>+ Add Note</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Note Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <ScrollView>
                <Text style={styles.modalTitle}>
                  {editingNote ? 'Edit Note' : 'New Note'}
                </Text>
                
                {/* Course Selection */}
                {!editingNote && courses.length > 0 && (
                  <View style={styles.courseSelector}>
                    <Text style={styles.label}>Course</Text>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={courses}
                      keyExtractor={item => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.courseOption,
                            selectedCourse === item.id && styles.courseOptionSelected
                          ]}
                          onPress={() => setSelectedCourse(item.id)}
                        >
                          <View style={[styles.courseDot, { backgroundColor: item.colorTheme || '#7C3AED' }]} />
                          <Text style={[
                            styles.courseOptionText,
                            selectedCourse === item.id && styles.courseOptionTextSelected
                          ]}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}

                {editingNote && courses.length > 0 && (
                  <View style={styles.selectedCourse}>
                    <View style={[styles.courseDot, { backgroundColor: courses.find(c => c.id === selectedCourse)?.colorTheme || '#7C3AED' }]} />
                    <Text style={styles.selectedCourseText}>
                      {courses.find(c => c.id === selectedCourse)?.name || 'Unknown Course'}
                    </Text>
                  </View>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Note Title"
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                />
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Note Content"
                  value={noteContent}
                  onChangeText={setNoteContent}
                  multiline
                  numberOfLines={10}
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
                    onPress={handleSaveNote}
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
  card: {
    margin: 15,
    marginBottom: 0,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteInfo: {
    flex: 1,
  },
  courseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  courseBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  noteActions: {
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
  noteContent: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  noteDate: {
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
  courseSelector: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
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
    marginRight: 8,
  },
  courseOptionSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F4F6',
  },
  courseOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  courseOptionTextSelected: {
    color: '#7C3AED',
  },
  selectedCourse: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  selectedCourseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
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
    height: 200,
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
});
