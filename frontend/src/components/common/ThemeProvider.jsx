import { useEffect } from 'react';
import useSettingsStore from '@/stores/settingsStore';

export default function ThemeProvider({ children }) {
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return children;
}