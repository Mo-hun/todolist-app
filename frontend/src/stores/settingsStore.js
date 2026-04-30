import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      language: 'ko',
      isDarkMode: false,
      setLanguage: (language) => set({ language }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (isDarkMode) => set({ isDarkMode }),
    }),
    { name: 'settings-storage' }
  )
);

export default useSettingsStore;