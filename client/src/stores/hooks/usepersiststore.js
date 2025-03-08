import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { recommendedThreads } from '../../logic/eval/engine';

export const useEvalStore = create()(
  subscribeWithSelector(
    persist(
      (set) => ({
        disable: true,
        multipv: 1,
        searchms: 1000,
        threads: recommendedThreads(),
        hashsize: 16,
        toggle: () => set((state) => ({ disable: !state.disable })),
      }),
      {
        name: 'eval-storage',
      }
    )
  )
);
