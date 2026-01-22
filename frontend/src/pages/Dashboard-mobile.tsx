// Mobile version of Dashboard using React Native
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { Task, Course } from '../lib/types';
import { getAll } from '../lib/db';

export default function Dashboard() {
  const { state } = useAppContext();
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get tasks
      const allTasks = state.tasks.length > 0 ? state.tasks : await getAll('tasks');
      const today = allTasks.filter(task => 
        task.dueDate >= today.getTime() && task.dueDate < tomorrow.getTime()
      );
      const week = allTasks.filter(task => 
        task.dueDate >= today.getTime() && task.dueDate < tomorrow.getTime() + (7 * 24 * 60 * 60 * 1000)
      );

      setTodaysTasks(today);
      setWeekTasks(week);

      // Get recent courses
      const courses = state.courses.length > 0 ? state.courses : await getAll('courses');
      setRecentCourses(courses.filter(c => !c.isArchived).slice(0, 3));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.welcomeText}>Welcome back! 👋</Text>
          <Text style={styles.subtitle}>Ready to continue your studies?</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          {todaysTasks.length > 0 ? (
            todaysTasks.map(task => (
              <View key={task.id} style={styles.taskItem}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDate}>
                  {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No tasks for today</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>This Week</Text>
          <Text style={styles.countText}>{weekTasks.length} tasks due this week</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Recent Courses</Text>
          {recentCourses.map(course => (
            <View key={course.id} style={styles.courseItem}>
              <View 
                style={[styles.colorDot, { backgroundColor: course.colorTheme || '#7C3AED' }]} 
              />
              <Text style={styles.courseName}>{course.name}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 15,
    marginBottom: 0,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  taskItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  taskTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  countText: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  courseName: {
    fontSize: 16,
    color: '#111827',
  },
});

