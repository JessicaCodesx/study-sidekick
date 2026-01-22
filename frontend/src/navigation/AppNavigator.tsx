// src/navigation/AppNavigator.tsx - Local storage only, no auth
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useAppContext } from '../context/AppContext';

// Main Screens
import Dashboard from '../pages/Dashboard';
import CoursesPage from '../pages/CoursesPage';
import NotesPage from '../pages/NotesPage';
import FlashcardsPage from '../pages/FlashcardsPage';
import CalendarPage from '../pages/CalendarPage';
import AcademicRecordsPage from '../pages/AcademicRecordsPage';
import SettingsPage from '../pages/SettingsPage';
import CourseGradesPage from '../pages/CourseGradesPage';

// Components
import CustomDrawer from './CustomDrawer';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Main Drawer Navigator
function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#7C3AED',
        },
        headerTintColor: '#fff',
      }}
    >
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Courses" component={CoursesPage} />
      <Drawer.Screen name="Notes" component={NotesPage} />
      <Drawer.Screen name="Flashcards" component={FlashcardsPage} />
      <Drawer.Screen name="Calendar" component={CalendarPage} />
      <Drawer.Screen name="AcademicRecords" component={AcademicRecordsPage} />
      <Drawer.Screen name="Settings" component={SettingsPage} />
    </Drawer.Navigator>
  );
}

// Root Navigator - No auth required for local-only app
export default function AppNavigator() {
  const { state, dispatch } = useAppContext();

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading StudySidekick...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainDrawer" component={MainDrawer} />
      <Stack.Screen 
        name="NotesDetail" 
        component={NotesPage}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen 
        name="FlashcardsDetail" 
        component={FlashcardsPage}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen 
        name="CourseGrades" 
        component={CourseGradesPage}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

