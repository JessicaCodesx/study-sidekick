// CalendarPage.tsx - Full React Native version with task management
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
  Picker 
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { Task, Course } from '../lib/types';
import { add, update, remove } from '../lib/db';
import { generateId, getCurrentTimestamp } from '../lib/utils';
// import DatePicker from 'react-native-date-picker';

export default function CalendarPage() {
  const { state, dispatch } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [taskType, setTaskType] = useState<'assignment' | 'exam' | 'quiz' | 'project' | 'reading' | 'other'>('assignment');
  const [status, setStatus] = useState<'pending' | 'completed' | 'overdue'>('pending');
  const [priority, setPriority] = useState(2);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const courses = state.courses.filter(c => !c.isArchived);

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setSelectedCourse('');
    setTaskType('assignment');
    setStatus('pending');
    setPriority(2);
    setDueDate(new Date());
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setSelectedCourse(task.courseId || '');
    setTaskType(task.type);
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(new Date(task.dueDate));
    setShowModal(true);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      const now = getCurrentTimestamp();
      
      if (editingTask) {
        const updatedTask: Task = {
          ...editingTask,
          title: taskTitle,
          description: taskDescription,
          courseId: selectedCourse,
          type: taskType,
          status,
          priority,
          dueDate: dueDate.getTime(),
          updatedAt: now,
        };
        await update('tasks', updatedTask);
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      } else {
        const newTask: Task = {
          id: generateId(),
          title: taskTitle,
          description: taskDescription,
          courseId: selectedCourse,
          type: taskType,
          status,
          priority,
          dueDate: dueDate.getTime(),
          createdAt: now,
          updatedAt: now,
        };
        await add('tasks', newTask);
        dispatch({ type: 'ADD_TASK', payload: newTask });
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task');
    }
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove('tasks', task.id);
              dispatch({ type: 'DELETE_TASK', payload: task.id });
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updatedTask = { ...task, status: newStatus, updatedAt: getCurrentTimestamp() };
    await update('tasks', updatedTask);
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  };

  const renderTaskCard = (task: Task) => {
    const course = state.courses.find(c => c.id === task.courseId);
    
    return (
      <Card key={task.id} style={styles.card}>
        <Card.Content>
          <View style={styles.taskHeader}>
            <View style={[
              styles.priorityDot,
              { backgroundColor: task.priority === 1 ? '#EF4444' : task.priority === 2 ? '#F59E0B' : '#10B981' }
            ]} />
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.taskMeta}>
                {course && (
                  <Text style={[styles.courseTag, { color: course.colorTheme || '#7C3AED' }]}>
                    {course.name}
                  </Text>
                )}
                <Text style={styles.taskType}>{task.type}</Text>
                <Text style={styles.taskDate}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleToggleStatus(task)}
              style={[styles.statusButton, task.status === 'completed' && styles.statusButtonCompleted]}
            >
              <Text style={[styles.statusButtonText, task.status === 'completed' && styles.statusButtonTextCompleted]}>
                {task.status === 'completed' ? '✓' : ''}
              </Text>
            </TouchableOpacity>
          </View>
          {task.description && (
            <Text style={styles.taskDesc}>{task.description}</Text>
          )}
          <View style={styles.taskActions}>
            <TouchableOpacity onPress={() => handleEditTask(task)} style={styles.actionBtn}>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTask(task)} style={[styles.actionBtn, styles.deleteBtn]}>
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar & Tasks</Text>
          <Text style={styles.headerSubtitle}>
            {state.tasks.length} tasks
          </Text>
        </View>

        {/* Upcoming Tasks */}
        {state.tasks
          .filter(t => t.status !== 'completed')
          .sort((a, b) => a.dueDate - b.dueDate)
          .slice(0, 10)
          .map(renderTaskCard)
        }

        {/* Completed Tasks */}
        {state.tasks.filter(t => t.status === 'completed').length > 0 && (
          <TouchableOpacity style={styles.showCompleted}>
            <Text style={styles.showCompletedText}>
              Show {state.tasks.filter(t => t.status === 'completed').length} completed tasks
            </Text>
          </TouchableOpacity>
        )}

        {/* Empty State */}
        {state.tasks.length === 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.emptyText}>No tasks yet</Text>
              <Text style={styles.emptySubtext}>Add tasks to see them here</Text>
            </Card.Content>
          </Card>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Task Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <ScrollView>
                <Text style={styles.modalTitle}>
                  {editingTask ? 'Edit Task' : 'New Task'}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Task Title"
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description (optional)"
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  multiline
                  numberOfLines={3}
                />

                {/* Course Selection */}
                {courses.length > 0 && (
                  <View style={styles.courseSelector}>
                    <Text style={styles.label}>Course</Text>
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

                {/* Task Type */}
                <Text style={styles.label}>Task Type</Text>
                <View style={styles.typeButtons}>
                  {['assignment', 'exam', 'quiz', 'project', 'reading', 'other'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        taskType === type && styles.typeButtonSelected
                      ]}
                      onPress={() => setTaskType(type as any)}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        taskType === type && styles.typeButtonTextSelected
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Priority */}
                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityButtons}>
                  {[1, 2, 3].map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityButton,
                        priority === p && styles.priorityButtonSelected
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        priority === p && styles.priorityButtonTextSelected
                      ]}>
                        {p === 1 ? 'High' : p === 2 ? 'Medium' : 'Low'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Due Date */}
                <Text style={styles.label}>Due Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {dueDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                {/* Date picker would go here - using text input for now */}
                <Text style={styles.input}>
                  {dueDate.toLocaleDateString()}
                </Text>

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
                    onPress={handleSaveTask}
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
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priorityDot: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  courseTag: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  taskType: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  taskDate: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusButtonCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  statusButtonText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  statusButtonTextCompleted: {
    color: '#fff',
  },
  taskDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
  },
  deleteText: {
    color: '#EF4444',
  },
  showCompleted: {
    padding: 16,
    alignItems: 'center',
  },
  showCompletedText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
    marginBottom: 8,
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
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  typeButtonSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F4F6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextSelected: {
    color: '#7C3AED',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  priorityButtonSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F4F6',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  priorityButtonTextSelected: {
    color: '#7C3AED',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#111827',
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
