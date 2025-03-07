import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { recommendedThreads } from '../../logic/eval/engine';

export const useEvalStore = create()(
  persist(
    (set) => ({
      disable: true,
      multipv: 1,
      searchms: 4000,
      threads: recommendedThreads(),
      hashsize: 16,
      toggle: () => set((state) => ({ disable: !state.disable })),
    }),
    {
      name: 'eval-storage',
    }
  )
);
