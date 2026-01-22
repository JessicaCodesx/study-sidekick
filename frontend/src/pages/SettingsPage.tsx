// SettingsPage.tsx - Web version with theme selector
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { exportDatabase, importDatabase } from '../lib/db';
import { useTheme } from '../context/ThemeContext';
import { ThemeName } from '../context/ThemeContext';
import Card from '../components/common/Card';

const themeOptions: Array<{ name: ThemeName; label: string; emoji: string; description: string; colors: { primary: string; secondary: string } }> = [
  { name: 'light', label: 'Light', emoji: '☀️', description: 'Clean and bright', colors: { primary: '#6b7280', secondary: '#9ca3af' } },
  { name: 'dark', label: 'Dark', emoji: '🌙', description: 'Easy on the eyes', colors: { primary: '#9ca3af', secondary: '#6b7280' } },
  { name: 'system', label: 'System', emoji: '💻', description: 'Follows your device', colors: { primary: '#8b5cf6', secondary: '#a78bfa' } },
  { name: 'pink', label: 'Pink', emoji: '💖', description: 'Cute and playful', colors: { primary: '#ec4899', secondary: '#f472b6' } },
  { name: 'ocean', label: 'Ocean', emoji: '🌊', description: 'Calm and refreshing', colors: { primary: '#06b6d4', secondary: '#22d3ee' } },
  { name: 'forest', label: 'Forest', emoji: '🌲', description: 'Natural and peaceful', colors: { primary: '#10b981', secondary: '#34d399' } },
  { name: 'sunset', label: 'Sunset', emoji: '🌅', description: 'Warm and vibrant', colors: { primary: '#f97316', secondary: '#fb923c' } },
  { name: 'lavender', label: 'Lavender', emoji: '💜', description: 'Elegant and soothing', colors: { primary: '#a855f7', secondary: '#c084fc' } },
  { name: 'mint', label: 'Mint', emoji: '🌿', description: 'Fresh and cute', colors: { primary: '#14b8a6', secondary: '#5eead4' } },
  { name: 'pastel', label: 'Pastel', emoji: '🎀', description: 'Soft and dreamy', colors: { primary: '#f0a9d0', secondary: '#f8c5e6' } },
  { name: 'vintage', label: 'Vintage', emoji: '📜', description: 'Warm and nostalgic', colors: { primary: '#d97706', secondary: '#f59e0b' } },
  { name: 'sakura', label: 'Sakura', emoji: '🌸', description: 'Cherry blossom pink', colors: { primary: '#f472b6', secondary: '#f9a8d4' } },
];

export default function SettingsPage() {
  const { state, dispatch } = useAppContext();
  const { theme, setTheme, darkMode, toggleTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await exportDatabase();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-sidekick-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!confirm('This will replace all your current data. Are you sure?')) {
        return;
      }

      try {
        setIsImporting(true);
        const text = await file.text();
        const data = JSON.parse(text);
        await importDatabase(JSON.stringify(data));
        alert('Data imported successfully! Please refresh the page.');
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Failed to import data');
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const handleClearAllData = () => {
    if (!confirm('This will delete all your courses, notes, flashcards, and tasks. This action cannot be undone. Are you sure?')) {
      return;
    }

    importDatabase(JSON.stringify({
      courses: [],
      units: [],
      notes: [],
      flashcards: [],
      tasks: [],
      academicRecords: [],
    })).then(() => {
      alert('Data cleared. Please refresh the page.');
    }).catch((error) => {
      console.error('Error clearing data:', error);
      alert('Failed to clear data');
    });
  };

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Customize your StudySidekick experience</p>
      </div>

      {/* Appearance */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h2>
          
          {/* Dark Mode Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between light and dark appearance</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Theme
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Choose a color theme. Each theme supports both light and dark modes.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {themeOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => setTheme(option.name)}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    theme === option.name
                      ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-200 dark:ring-primary-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } bg-white dark:bg-gray-800`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-3xl">{option.emoji}</span>
                    <div className="text-center">
                      <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                    <div className="flex space-x-1 mt-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: option.colors.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: option.colors.secondary }}
                      />
                    </div>
                  </div>
                  {theme === option.name && (
                    <div className="absolute top-2 right-2">
                      <svg
                        className="w-5 h-5 text-primary-500 dark:text-primary-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Management</h2>
          
          <div className="space-y-3">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </button>
            
            <button
              onClick={handleImportData}
              disabled={isImporting}
              className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing...' : 'Import Data'}
            </button>
            
            <button
              onClick={handleClearAllData}
              className="w-full px-4 py-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg font-medium transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Statistics</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                {state.courses.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                {state.tasks.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                {state.notes.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Notes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                {state.flashcards.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Flashcards</div>
            </div>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">About</h2>
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              StudySidekick v1.0.0
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Local storage only
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              No data leaves your device
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
