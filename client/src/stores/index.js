import { createStore, useStore } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { createGameSlice } from './slices/gameslice';
import { createBoardSlice } from './slices/boardslice';
import { createModeSlice } from './slices/modeslice';
import { createFenSlice } from './slices/fenslice';
import { ChessController } from 'src/logic/';
import { recommendedThreads } from 'src/logic/eval/engine';

export const evalStore = createStore(
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

export const mainStore = createStore(
  subscribeWithSelector((...a) => ({
    ...createModeSlice(new ChessController('analyse'))(...a),
    ...createGameSlice(...a),
    ...createBoardSlice(...a),
    ...createFenSlice(...a),
  }))
);
export const useMainStore = (selector) => useStore(mainStore, selector);
export const useEvalStore = (selector) => useStore(evalStore, selector);
