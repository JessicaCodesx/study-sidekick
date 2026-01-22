// src/navigation/CustomDrawer.tsx - Custom drawer for mobile
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const { state } = useAppContext();

  const drawerItems = [
    { label: 'Dashboard', icon: 'home-outline', screen: 'Dashboard' },
    { label: 'Courses', icon: 'book-outline', screen: 'Courses' },
    { label: 'Notes', icon: 'document-text-outline', screen: 'Notes' },
    { label: 'Flashcards', icon: 'flash-outline', screen: 'Flashcards' },
    { label: 'Calendar', icon: 'calendar-outline', screen: 'Calendar' },
    { label: 'Academic Records', icon: 'school-outline', screen: 'AcademicRecords' },
    { label: 'Settings', icon: 'settings-outline', screen: 'Settings' },
  ];

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>StudySidekick</Text>
          <Text style={styles.headerSubtitle}>Local Storage Only</Text>
        </View>

        <View style={styles.menuContainer}>
          {drawerItems.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={[
                styles.menuItem,
                props.state.routes[props.state.index]?.name === item.screen && styles.activeMenuItem
              ]}
              onPress={() => props.navigation.navigate(item.screen)}
            >
              <Ionicons 
                name={item.icon as any} 
                size={24} 
                color={props.state.routes[props.state.index]?.name === item.screen ? '#7C3AED' : '#666'} 
              />
              <Text style={[
                styles.menuItemText,
                props.state.routes[props.state.index]?.name === item.screen && styles.activeMenuItemText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          All data is stored locally on your device
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#7C3AED',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingLeft: 20,
  },
  activeMenuItem: {
    backgroundColor: '#F3F4F6',
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#666',
  },
  activeMenuItemText: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 10,
  },
});

