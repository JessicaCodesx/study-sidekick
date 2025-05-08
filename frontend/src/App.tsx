import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ThemeContext from './context/ThemeContext';
import { initDB, getUserSettings } from './lib/db';

// Layout and Pages
import Navigation from './components/layout/Navigation';
import Sidebar from './components/layout/Sidebar';
import PageContainer from './components/layout/PageContainer';

import LandingPage from './pages/LandingPage';


import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import NotesPage from './pages/NotesPage';
import FlashcardsPage from './pages/FlashcardsPage';
import CalendarPage from './pages/CalendarPage';
import AcademicRecordsPage from './pages/AcademicRecordsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import CourseGradesPage from './pages/CourseGradesPage';

import './styles/courseColors.css';
import './App.css';

// Auth
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import ProtectedRoute from './components/auth/ProtectedRoute';
import React from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system' | 'pink'>('system');
  const [isDBReady, setIsDBReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const initializeTheme = async () => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | 'pink';

      if (savedTheme) {
        setThemeState(savedTheme);
        setDarkMode(savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);

        try {
          const userSettings = await getUserSettings();
          if (userSettings?.theme) {
            setThemeState(userSettings.theme);
            setDarkMode(userSettings.theme === 'dark' || (userSettings.theme === 'system' && prefersDark));
          }
        } catch (error) {
          console.error("Couldn't load user theme preference:", error);
        }
      }
    };

    initializeTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') === 'system') {
        setDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const setupDB = async () => {
      try {
        await initDB();
        setIsDBReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    setupDB();
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    const newTheme = newDarkMode ? 'dark' : 'light';
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system' | 'pink') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'system') {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setDarkMode(newTheme === 'dark');
    }
  };

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'theme-pink');
    if (darkMode) document.documentElement.classList.add('dark');
    if (theme === 'pink') document.documentElement.classList.add('theme-pink');
  }, [darkMode, theme]);

  if (!isDBReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50 dark:bg-purple-950 theme-pink:bg-pink-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-100 theme-pink:text-pink-600">
            Loading StudySidekick...
          </h1>
          <div className="mt-4">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent theme-pink:border-pink-400 theme-pink:border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, theme, setTheme }}>
      <AuthProvider>
        <AppProvider>
          <HashRouter>
            <div className={`h-screen w-screen flex flex-col 
              ${theme === 'pink' 
                ? 'bg-pink-50 text-pink-900' 
                : 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'} 
              transition-colors duration-300 overflow-hidden
              ${theme === 'pink' ? 'font-cute' : 'font-sans'}`}>

              <Routes>
                {/* Public Auth Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Protected Routes */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <>
                      <Navigation 
                        isSidebarOpen={isSidebarOpen} 
                        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                      />
                      <div className="flex flex-1 overflow-hidden">
                        <Sidebar isOpen={isSidebarOpen} />
                        <main className={`flex-1 overflow-auto ${theme === 'pink' ? 'bg-gradient-to-br from-pink-50 via-pink-50 to-purple-50' : ''}`}>
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/courses" element={<CoursesPage />} />
                            <Route path="/courses/:courseId/notes" element={<NotesPage />} />
                            <Route path="/courses/:courseId/flashcards" element={<FlashcardsPage />} />
                            <Route path="/courses/:courseId/grades" element={<CourseGradesPage />} />
                            <Route path="/calendar" element={<CalendarPage />} />
                            <Route path="/academic-records" element={<AcademicRecordsPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                          </Routes>
                        </main>
                      </div>
                    </>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </HashRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

export default App;
