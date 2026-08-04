import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, default to 'light'
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    // Declare the active scheme so mobile browsers stop auto-inverting our
    // light pages, and native UI (scrollbars, form controls) matches the theme.
    root.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
    // Keep the mobile address-bar color (theme-color) in sync with the theme.
    // Values mirror --color-bg (--primitive-gray-50 / -900); read directly so a
    // background fade-in transition can't capture a half-opaque value.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#f7f9f4');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

