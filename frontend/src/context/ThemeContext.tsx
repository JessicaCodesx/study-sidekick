// ThemeContext.tsx - Web version
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 
  | 'light' 
  | 'dark' 
  | 'system' 
  | 'pink'
  | 'ocean'
  | 'forest'
  | 'sunset'
  | 'lavender'
  | 'mint'
  | 'pastel'
  | 'vintage'
  | 'sakura';

export type Theme = ThemeName;

interface ThemeContextValue {
  darkMode: boolean;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false,
  theme: 'system',
  toggleTheme: () => {},
  setTheme: () => {},
  setDarkMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [systemColorScheme, setSystemColorScheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [theme, setThemeState] = useState<Theme>('system');

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemColorScheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Determine dark mode based on theme
  const darkMode = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    // If switching to system, use system preference
    if (newTheme === 'system') {
      setSystemColorScheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
  };

  const setDarkMode = (dark: boolean) => {
    // This will be handled by the parent component
  };

  return (
    <ThemeContext.Provider value={{ darkMode, theme, toggleTheme, setTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
