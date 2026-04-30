import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTodoStore = create(
  persist(
    (set) => ({
      filter: 'all',
      sortBy: 'created_at',
      setFilter: (filter) => set({ filter }),
      setSortBy: (sortBy) => set({ sortBy }),
    }),
    { name: 'todo-storage' }
  )
);

export default useTodoStore;
