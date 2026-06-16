import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('gazqueue_theme') || 'dark';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gazqueue_theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    // Add a theme-transitioning class for smooth transitions
    document.documentElement.classList.add('theme-transitioning');
    setTheme(t => t === 'light' ? 'dark' : 'light');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 400);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
