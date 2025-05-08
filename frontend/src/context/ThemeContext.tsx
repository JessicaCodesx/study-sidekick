import { createContext } from 'react';

// Update the ThemeContextType to include theme type
interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
  theme: 'light' | 'dark' | 'system' | 'pink';
  setTheme: (theme: 'light' | 'dark' | 'system' | 'pink') => void;
}

// Default context values
const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleTheme: () => {}, // Default empty function
  theme: 'system',
  setTheme: () => {}, // Default empty function
});

export default ThemeContext;