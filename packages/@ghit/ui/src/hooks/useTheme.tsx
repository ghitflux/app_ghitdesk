import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Hook to manage theme (light/dark)
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('ghit-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ghit-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('ghit-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return {
    theme,
    toggleTheme,
    setTheme: setThemeValue,
    isDark: theme === 'dark',
  };
}
