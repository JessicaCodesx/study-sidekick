import { useState, useEffect, useContext } from 'react';
import { useAppContext } from '../context/AppContext';
import ThemeContext from '../context/ThemeContext';
import { getUserSettings, saveUserSettings, exportDatabase, importDatabase, clearAllData } from '../lib/db';
import { User } from '../lib/types';
import Button from '../components/common/Button';
import Card, { CardTitle, CardContent, CardFooter } from '../components/common/Card';
import PageContainer from '../components/layout/PageContainer';
import { motion } from 'framer-motion';


const SettingsPage = () => {
  const { state, dispatch } = useAppContext();
  const { darkMode, toggleTheme, theme, setTheme } = useContext(ThemeContext);
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system' | 'pink'>('system');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const user = await getUserSettings();
        
        if (user) {
          setDisplayName(user.displayName);
          setAvatar(user.avatar);
          setSelectedTheme((user.theme as 'light' | 'dark' | 'system' | 'pink') || 'system');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading user settings:', err);
        setError('Failed to load settings');
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Update selected theme when theme context changes
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  // Handle save settings
  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userSettings: User = {
        displayName: displayName || 'Student',
        avatar,
        theme: selectedTheme,
        studyStreak: state.user?.studyStreak || 0,
        lastStudyDate: state.user?.lastStudyDate,
      };
      
      await saveUserSettings(userSettings);
      dispatch({ type: 'SET_USER', payload: userSettings });
      
      // Apply theme changes immediately
      setTheme(selectedTheme);
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error saving user settings:', err);
      setError('Failed to save settings');
      setIsLoading(false);
    }
  };

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result.toString());
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle export data
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      const exportedData = await exportDatabase();
      
      // Create download file
      const blob = new Blob([exportedData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-sidekick-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
      setIsExporting(false);
    }
  };

  // Handle import data
  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsImporting(true);
      
      // Read file
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const jsonData = event.target.result.toString();
          
          try {
            // Validate JSON
            JSON.parse(jsonData);
            
            // Confirm import
            if (window.confirm('Importing data will replace all your current data. This cannot be undone. Continue?')) {
              await importDatabase(jsonData);
              window.location.reload();
            }
          } catch (parseError) {
            setError('Invalid backup file format');
          }
        }
        setIsImporting(false);
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Error importing data:', err);
      setError('Failed to import data');
      setIsImporting(false);
    }
  };

  // Handle reset data
  const handleResetData = async () => {
    if (window.confirm('This will delete ALL your data. This action cannot be undone. Are you sure?')) {
      try {
        setIsResetting(true);
        
        await clearAllData();
        
        setIsResetting(false);
        window.location.reload();
      } catch (err) {
        console.error('Error resetting data:', err);
        setError('Failed to reset data');
        setIsResetting(false);
      }
    }
  };

  return (
    <PageContainer>
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-700 theme-pink:from-pink-50 theme-pink:to-pink-100 shadow-sm">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white theme-pink:text-pink-600">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300 theme-pink:text-pink-500 mt-1">
          Manage your profile, appearance, data, and more.
        </p>
      </motion.div>
    </div>

      
      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 theme-pink:bg-pink-100 theme-pink:text-pink-700 rounded">
          {error}
        </div>
      )}
      
      {isSaved && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 theme-pink:bg-pink-100 theme-pink:text-pink-700 rounded">
          Settings saved successfully!
        </div>
      )}
      
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardTitle>Profile Settings</CardTitle>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Profile Picture
              </label>
              <div className="mt-1 flex items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 theme-pink:bg-pink-100 flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-medium text-gray-600 dark:text-gray-400 theme-pink:text-pink-400">
                      {displayName ? displayName.charAt(0).toUpperCase() : 'S'}
                    </span>
                  )}
                </div>
                <label htmlFor="avatar-upload" className="ml-3 cursor-pointer">
                  <span className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 theme-pink:border-pink-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50 focus:outline-none">
                    Change
                  </span>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                </label>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar(undefined)}
                    className="ml-2 text-sm text-red-600 dark:text-red-400 theme-pink:text-pink-600 hover:text-red-800 dark:hover:text-red-300 theme-pink:hover:text-pink-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              onClick={handleSaveSettings}
              isLoading={isLoading}
            >
              Save Profile
            </Button>
          </CardFooter>
        </Card>
        
        {/* Appearance Settings */}
        <Card>
          <CardTitle>Appearance</CardTitle>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Theme
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div
                  className={`flex items-center p-3 border ${
                    selectedTheme === 'light'
                      ? 'border-primary-500 ring-2 ring-primary-500 theme-pink:border-pink-500 theme-pink:ring-pink-500'
                      : 'border-gray-300 dark:border-gray-600 theme-pink:border-pink-200'
                  } rounded-lg cursor-pointer`}
                  onClick={() => setSelectedTheme('light')}
                >
                  <div className="w-4 h-4 rounded-full bg-white border border-gray-300 mr-2"></div>
                  <span className="text-sm font-medium">Light</span>
                </div>
                
                <div
                  className={`flex items-center p-3 border ${
                    selectedTheme === 'dark'
                      ? 'border-primary-500 ring-2 ring-primary-500 theme-pink:border-pink-500 theme-pink:ring-pink-500'
                      : 'border-gray-300 dark:border-gray-600 theme-pink:border-pink-200'
                  } rounded-lg cursor-pointer`}
                  onClick={() => setSelectedTheme('dark')}
                >
                  <div className="w-4 h-4 rounded-full bg-gray-900 border border-gray-300 mr-2"></div>
                  <span className="text-sm font-medium">Dark</span>
                </div>
                
                <div
                  className={`flex items-center p-3 border ${
                    selectedTheme === 'system'
                      ? 'border-primary-500 ring-2 ring-primary-500 theme-pink:border-pink-500 theme-pink:ring-pink-500'
                      : 'border-gray-300 dark:border-gray-600 theme-pink:border-pink-200'
                  } rounded-lg cursor-pointer`}
                  onClick={() => setSelectedTheme('system')}
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-white to-gray-900 border border-gray-300 mr-2"></div>
                  <span className="text-sm font-medium">System</span>
                </div>
                
                {/* Pink Theme Option */}
                <div
                  className={`flex items-center p-3 border ${
                    selectedTheme === 'pink'
                      ? 'border-primary-500 ring-2 ring-primary-500 theme-pink:border-pink-500 theme-pink:ring-pink-500'
                      : 'border-gray-300 dark:border-gray-600 theme-pink:border-pink-200'
                  } rounded-lg cursor-pointer`}
                  onClick={() => setSelectedTheme('pink')}
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-300 to-pink-500 border border-gray-300 mr-2"></div>
                  <span className="text-sm font-medium">Pink</span>
                  <span className="ml-1 text-pink-500">💗</span>
                </div>
              </div>
              
              {/* Theme Preview */}
              <div className="mt-4 border rounded-lg p-4 border-gray-200 dark:border-gray-700 theme-pink:border-pink-200">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700 mb-2">Theme Preview</h4>
                <div className={`p-3 rounded-lg ${
                  selectedTheme === 'pink'
                    ? 'bg-pink-50 border border-pink-200'
                    : selectedTheme === 'dark'
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200'
                }`}>
                  <div className={`text-sm ${
                    selectedTheme === 'pink'
                      ? 'text-pink-700'
                      : selectedTheme === 'dark'
                        ? 'text-gray-200'
                        : 'text-gray-700'
                  }`}>
                    This is how your theme will look
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <div className={`px-3 py-1 text-xs rounded-full ${
                      selectedTheme === 'pink'
                        ? 'bg-pink-400 text-white'
                        : selectedTheme === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                    }`}>
                      Primary Button
                    </div>
                    <div className={`px-3 py-1 text-xs rounded-full ${
                      selectedTheme === 'pink'
                        ? 'border border-pink-400 text-pink-500'
                        : selectedTheme === 'dark'
                          ? 'border border-gray-600 text-gray-300'
                          : 'border border-gray-300 text-gray-600'
                    }`}>
                      Secondary Button
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              onClick={handleSaveSettings}
              isLoading={isLoading}
            >
              Save Appearance
            </Button>
          </CardFooter>
        </Card>
        
        {/* Data Management */}
        <Card>
          <CardTitle>Data Management</CardTitle>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-700">
              StudySidekick stores all your data locally on your device. You can export your data for backup or transfer to another device.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700 mb-2">Export Data</h3>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  isLoading={isExporting}
                  isFullWidth
                >
                  Export as JSON
                </Button>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700 mb-2">Import Data</h3>
                <label htmlFor="import-file" className="block">
                  <div className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 theme-pink:border-pink-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 theme-pink:hover:bg-pink-50 focus:outline-none cursor-pointer">
                    {isImporting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Importing...
                      </span>
                    ) : (
                      'Import from JSON'
                    )}
                  </div>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    className="sr-only"
                    onChange={handleImportData}
                    disabled={isImporting}
                  />
                </label>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 theme-pink:border-pink-200 pt-4 mt-4">
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400 theme-pink:text-pink-700 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-700 mb-2">
                This action cannot be undone. All your courses, notes, flashcards, tasks, and settings will be permanently deleted.
              </p>
              <Button
                variant="danger"
                onClick={handleResetData}
                isLoading={isResetting}
              >
                Reset All Data
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* About */}
        <Card>
          <CardTitle>About StudySidekick</CardTitle>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-700">
              StudySidekick is an all-in-one study assistant designed to help students manage their courses, due dates, notes, flashcards, grades, and study schedules in one beautifully organized place.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-700 mt-2">
              Version: 1.0.0
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;