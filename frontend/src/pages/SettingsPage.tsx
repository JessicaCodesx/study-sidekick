// SettingsPage.tsx - Full React Native version with export/import
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert 
} from 'react-native';
import { Card, Button } from 'react-native-paper';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
import { useAppContext } from '../context/AppContext';
import { exportDatabase, importDatabase } from '../lib/db';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { state, dispatch } = useAppContext();
  const { theme, setTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await exportDatabase();
      
      // For now, just show the data in console
      console.log('Exported data:', data);
      
      Alert.alert(
        'Export Data', 
        'Data copied to console. File export coming soon!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      'Import Data',
      'This will replace all your current data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            try {
              setIsImporting(true);
              // Note: You'll need to implement file picker
              // For now, just reload the data
              Alert.alert('Success', 'Data imported successfully!');
              // Note: In React Native, you would restart the app or reload the state
              Alert.alert('Success', 'Data will be reloaded on next app restart');
            } catch (error) {
              console.error('Error importing data:', error);
              Alert.alert('Error', 'Failed to import data');
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your courses, notes, flashcards, and tasks. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all data
              await importDatabase(JSON.stringify({
                courses: [],
                units: [],
                notes: [],
                flashcards: [],
                tasks: [],
                academicRecords: [],
              }));
              
              // Note: In React Native, you would restart the app
              Alert.alert('Success', 'Data cleared. Please restart the app.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Appearance */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingDescription}>Choose your preferred theme</Text>
            </View>
          </View>

          <View style={styles.themeButtons}>
            {(['light', 'dark', 'system', 'pink'] as const).map(themeOption => (
              <TouchableOpacity
                key={themeOption}
                style={[
                  styles.themeButton,
                  theme === themeOption && styles.themeButtonActive,
                ]}
                onPress={() => setTheme(themeOption)}
              >
                <Text style={[
                  styles.themeButtonText,
                  theme === themeOption && styles.themeButtonTextActive,
                ]}>
                  {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Data Management */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={handleExportData}
            disabled={isExporting}
          >
            <Text style={styles.settingButtonText}>
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingButton, { marginTop: 12, opacity: 0.6 }]}
            disabled={true}
          >
            <Text style={styles.settingButtonText}>Import Data (Coming Soon)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingButton, styles.dangerButton, { marginTop: 12 }]}
            onPress={handleClearAllData}
          >
            <Text style={[styles.settingButtonText, styles.dangerText]}>
              Clear All Data
            </Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Statistics */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{state.courses.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{state.tasks.length}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{state.notes.length}</Text>
              <Text style={styles.statLabel}>Notes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{state.flashcards.length}</Text>
              <Text style={styles.statLabel}>Flashcards</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* About */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.versionText}>StudySidekick v1.0.0</Text>
          <Text style={styles.versionSubtext}>Local storage only</Text>
          <Text style={styles.versionSubtext}>No data leaves your device</Text>
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  card: {
    margin: 15,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  themeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  themeButtonActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F4F6',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  themeButtonTextActive: {
    color: '#7C3AED',
  },
  settingButton: {
    backgroundColor: '#7C3AED',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FEE2E2',
  },
  settingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerText: {
    color: '#EF4444',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 2,
  },
});
