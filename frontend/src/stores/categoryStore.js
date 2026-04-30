import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCategoryStore = create(
  persist(
    (set) => ({
      selectedCategoryId: null,
      selectCategory: (id) => set({ selectedCategoryId: id }),
      clearCategory: () => set({ selectedCategoryId: null }),
    }),
    { name: 'category-storage' }
  )
);

export default useCategoryStore;
