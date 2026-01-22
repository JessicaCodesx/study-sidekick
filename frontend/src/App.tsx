import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ThemeContext, { ThemeName } from './context/ThemeContext';
import { initDB, getUserSettings } from './lib/db';
import PageTransition from './components/common/PageTransition';

// Layout and Pages
import Navigation from './components/layout/Navigation';
import Sidebar from './components/layout/Sidebar';
import PageContainer from './components/layout/PageContainer';

import LandingPage from './pages/LandingPage';
import WelcomeModal from './components/common/WelcomeModal';

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

// Helper function to get theme classes
function getThemeClasses(theme: ThemeName, darkMode: boolean): string {
  const themeConfig: Record<ThemeName, { bg: string; text: string; font?: string }> = {
    light: { bg: 'bg-gray-50', text: 'text-gray-900', font: 'font-sans' },
    dark: { bg: 'bg-gray-900', text: 'text-gray-100', font: 'font-sans' },
    system: { bg: darkMode ? 'bg-gray-900' : 'bg-gray-50', text: darkMode ? 'text-gray-100' : 'text-gray-900', font: 'font-sans' },
    pink: { bg: darkMode ? 'bg-pink-950' : 'bg-pink-50', text: darkMode ? 'text-pink-100' : 'text-pink-900', font: 'font-cute' },
    ocean: { bg: darkMode ? 'bg-cyan-950' : 'bg-cyan-50', text: darkMode ? 'text-cyan-100' : 'text-cyan-900', font: 'font-sans' },
    forest: { bg: darkMode ? 'bg-emerald-950' : 'bg-emerald-50', text: darkMode ? 'text-emerald-100' : 'text-emerald-900', font: 'font-sans' },
    sunset: { bg: darkMode ? 'bg-orange-950' : 'bg-orange-50', text: darkMode ? 'text-orange-100' : 'text-orange-900', font: 'font-sans' },
    lavender: { bg: darkMode ? 'bg-purple-950' : 'bg-purple-50', text: darkMode ? 'text-purple-100' : 'text-purple-900', font: 'font-sans' },
    mint: { bg: darkMode ? 'bg-teal-950' : 'bg-teal-50', text: darkMode ? 'text-teal-100' : 'text-teal-900', font: 'font-cute' },
    pastel: { bg: darkMode ? 'bg-pink-950' : 'bg-pink-50', text: darkMode ? 'text-pink-100' : 'text-pink-900', font: 'font-cute' },
    vintage: { bg: darkMode ? 'bg-amber-950' : 'bg-amber-50', text: darkMode ? 'text-amber-100' : 'text-amber-900', font: 'font-sans' },
    sakura: { bg: darkMode ? 'bg-rose-950' : 'bg-rose-50', text: darkMode ? 'text-rose-100' : 'text-rose-900', font: 'font-cute' },
  };

  const config = themeConfig[theme] || themeConfig.system;
  return `${config.bg} ${config.text} ${config.font || 'font-sans'}`;
}

// Helper function for main background gradients
function getMainBackgroundClass(theme: ThemeName, darkMode: boolean): string {
  if (theme === 'light' || theme === 'dark' || theme === 'system') {
    return '';
  }
  
  const gradients: Record<ThemeName, { light: string; dark: string }> = {
    pink: { light: 'bg-gradient-to-br from-pink-50 via-pink-50 to-purple-50', dark: 'bg-gradient-to-br from-pink-950 via-rose-900 to-purple-950' },
    ocean: { light: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50', dark: 'bg-gradient-to-br from-cyan-950 via-blue-900 to-teal-950' },
    forest: { light: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50', dark: 'bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950' },
    sunset: { light: 'bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50', dark: 'bg-gradient-to-br from-orange-950 via-amber-900 to-pink-950' },
    lavender: { light: 'bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50', dark: 'bg-gradient-to-br from-purple-950 via-violet-900 to-fuchsia-950' },
    mint: { light: 'bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50', dark: 'bg-gradient-to-br from-teal-950 via-emerald-900 to-cyan-950' },
    pastel: { light: 'bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50', dark: 'bg-gradient-to-br from-pink-950 via-rose-900 to-purple-950' },
    vintage: { light: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50', dark: 'bg-gradient-to-br from-amber-950 via-yellow-900 to-orange-950' },
    sakura: { light: 'bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50', dark: 'bg-gradient-to-br from-rose-950 via-pink-900 to-fuchsia-950' },
  };

  const gradient = gradients[theme];
  return gradient ? (darkMode ? gradient.dark : gradient.light) : '';
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setThemeState] = useState<ThemeName>('system');
  const [isDBReady, setIsDBReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const initializeTheme = async () => {
      const savedTheme = localStorage.getItem('theme') as ThemeName | null;
      const savedDarkMode = localStorage.getItem('darkMode');

      if (savedTheme) {
        setThemeState(savedTheme);
        if (savedDarkMode !== null) {
          setDarkMode(savedDarkMode === 'true');
        } else {
          setDarkMode(savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
        }
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);

        try {
          const userSettings = await getUserSettings();
          if (userSettings?.theme) {
            setThemeState(userSettings.theme as ThemeName);
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
      const currentTheme = localStorage.getItem('theme') as ThemeName;
      if (currentTheme === 'system') {
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
        
        // Check if user has any data and if welcome modal was already shown
        const welcomeShown = localStorage.getItem('welcomeModalShown');
        if (!welcomeShown) {
          // Check if there's any existing data
          const { getAll } = await import('./lib/db');
          const [courses, tasks, flashcards, notes] = await Promise.all([
            getAll('courses').catch(() => []),
            getAll('tasks').catch(() => []),
            getAll('flashcards').catch(() => []),
            getAll('notes').catch(() => []),
          ]);
          
          // Show welcome modal only if there's no data
          const hasData = courses.length > 0 || tasks.length > 0 || flashcards.length > 0 || notes.length > 0;
          if (!hasData) {
            setShowWelcomeModal(true);
          }
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    setupDB();
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('welcomeModalShown', 'true');
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
  };

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemDark);
      localStorage.setItem('darkMode', String(systemDark));
    } else if (newTheme === 'light') {
      setDarkMode(false);
      localStorage.setItem('darkMode', 'false');
    } else if (newTheme === 'dark') {
      setDarkMode(true);
      localStorage.setItem('darkMode', 'true');
    }
    // For other themes (pink, ocean, etc.), keep current dark mode setting
  };

  // Apply theme classes to document
  useEffect(() => {
    // Remove all theme classes
    const themeClasses = ['dark', 'theme-pink', 'theme-ocean', 'theme-forest', 'theme-sunset', 
                          'theme-lavender', 'theme-mint', 'theme-pastel', 'theme-vintage', 'theme-sakura'];
    document.documentElement.classList.remove(...themeClasses);
    
    // Add dark mode class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
    
    // Add theme class (skip for light, dark, system)
    if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
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
    <ThemeContext.Provider value={{ darkMode, toggleTheme, theme, setTheme, setDarkMode: (dark: boolean) => {
      setDarkMode(dark);
      localStorage.setItem('darkMode', String(dark));
    } }}>
      <AuthProvider>
        <AppProvider>
          <HashRouter>
            <div className={`h-screen w-screen flex flex-col 
              transition-colors duration-300 overflow-hidden
              ${getThemeClasses(theme, darkMode)}`}>

              <Routes>
                {/* Public Auth Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Protected Routes */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <>
                      {/* Welcome Modal for first-time users */}
                      <WelcomeModal
                        isOpen={showWelcomeModal}
                        onClose={handleCloseWelcomeModal}
                      />
                      <Navigation 
                        isSidebarOpen={isSidebarOpen} 
                        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                      />
                      <div className="flex flex-1 overflow-hidden">
                        <Sidebar isOpen={isSidebarOpen} />
                        <main className={`flex-1 overflow-auto ${getMainBackgroundClass(theme, darkMode)}`}>
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
