import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useEvalStore = create()(
  persist(
    (set, get) => ({
      disable: 0,
      multipv: 1,
      searchms: 4000,
      threads: undefined,
      addABear: () => set({ threads: get().threads + 1 }),
    }),
    {
      name: 'eval-storage',
    }
  )
);
