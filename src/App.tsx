import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ThemeContext from './context/ThemeContext';
import { initDB, getUserSettings } from './lib/db';
import Navigation from './components/layout/Navigation';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import NotesPage from './pages/NotesPage';
import FlashcardsPage from './pages/FlashcardsPage';
import CalendarPage from './pages/CalendarPage';
import AcademicRecordsPage from './pages/AcademicRecordsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import PageContainer from './components/layout/PageContainer';
import CourseGradesPage from './pages/CourseGradesPage';
import './styles/courseColors.css';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system' | 'pink'>('system');
  const [isDBReady, setIsDBReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = async () => {
      // First try to get theme from localStorage
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | 'pink';
      
      if (savedTheme) {
        setThemeState(savedTheme);
        
        if (savedTheme === 'dark') {
          setDarkMode(true);
        } else if (savedTheme === 'light' || savedTheme === 'pink') {
          setDarkMode(false);
        } else if (savedTheme === 'system') {
          // If theme is 'system', check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setDarkMode(prefersDark);
        }
      } else {
        // No saved theme, check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
        
        // Also check if the user settings in the database have a theme preference
        try {
          const userSettings = await getUserSettings();
          if (userSettings && userSettings.theme) {
            setThemeState(userSettings.theme as 'light' | 'dark' | 'system' | 'pink');
            
            if (userSettings.theme === 'dark') {
              setDarkMode(true);
            } else if (userSettings.theme === 'light' || userSettings.theme === 'pink') {
              setDarkMode(false);
            }
            // If theme is 'system', we already set it based on system preference
          }
        } catch (error) {
          console.error("Couldn't load user theme preference:", error);
        }
      }
    };
    
    initializeTheme();
    
    // Listen for changes in system color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | 'pink';
      if (currentTheme === 'system') {
        setDarkMode(e.matches);
      }
    };
    
    // Add listener for system color scheme changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Initialize the database
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

  // Toggle dark/light mode
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // If currently in system mode, switch to explicit mode
    if (theme === 'system') {
      const newTheme = newDarkMode ? 'dark' : 'light';
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
    } else if (theme === 'pink') {
      // If in pink theme and toggling, go to light/dark
      const newTheme = newDarkMode ? 'dark' : 'light';
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
    } else {
      // Otherwise just save the dark mode state
      localStorage.setItem('darkMode', String(newDarkMode));
    }
  };

  // Function to explicitly set the theme
  const setTheme = (newTheme: 'light' | 'dark' | 'system' | 'pink') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update dark mode based on theme
    if (newTheme === 'dark') {
      setDarkMode(true);
    } else if (newTheme === 'light' || newTheme === 'pink') {
      setDarkMode(false);
    } else if (newTheme === 'system') {
      // If system, use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  };

  // Apply theme classes to document
  useEffect(() => {
    // First clear any theme classes
    document.documentElement.classList.remove('dark', 'theme-pink');
    
    // Apply appropriate theme class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
    
    if (theme === 'pink') {
      document.documentElement.classList.add('theme-pink');
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
    <ThemeContext.Provider value={{ darkMode, toggleTheme, theme, setTheme }}>
      <AppProvider>
        <HashRouter>
          <div className={`h-screen w-screen flex flex-col 
            ${theme === 'pink' 
              ? 'bg-pink-50 text-pink-900' 
              : 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'} 
            transition-colors duration-300 overflow-hidden
            ${theme === 'pink' ? 'font-cute' : 'font-sans'}`}>
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
          </div>
        </HashRouter>
      </AppProvider>
    </ThemeContext.Provider>
  );
}

export default App;