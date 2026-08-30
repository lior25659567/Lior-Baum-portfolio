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
  // Pixel design system is light-only. Always resolve to 'light' regardless of
  // any previously stored preference (a returning visitor with
  // localStorage.theme==='dark' still gets light).
  const [theme] = useState('light');

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
    // Declare the active scheme so mobile browsers stop auto-inverting our
    // light pages, and native UI (scrollbars, form controls) matches the theme.
    root.style.colorScheme = 'light';
    localStorage.setItem('theme', 'light');
    // Keep the mobile address-bar color (theme-color) in sync.
    // Value mirrors --color-bg (--primitive-gray-50).
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#f7f9f4');
  }, []);

  // No-op: dark mode is permanently removed. Kept so callers don't break.
  const toggleTheme = () => {};
  const setTheme = () => {};

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: false,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

