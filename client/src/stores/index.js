import { createStore, useStore } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { createSettingSlice } from './slices/settingslice';
import { createFenSlice } from './slices/fenslice';
import { recommendedThreads } from 'src/logic/eval/engine';

export const evalStore = createStore(
  subscribeWithSelector(
    persist(
      () => ({
        multipv: 1,
        searchms: 3000,
        threads: recommendedThreads(),
        hashsize: 16,
      }),
      {
        name: 'eval-storage',
      }
    )
  )
);

const withStorageDOMEvents = (store) => {
  const storageEventCallback = (e) => {
    if (e.key === store.persist.getOptions().name && e.newValue) {
      store.persist.rehydrate();
    }
  };

  window.addEventListener('storage', storageEventCallback);

  return () => {
    window.removeEventListener('storage', storageEventCallback);
  };
};

withStorageDOMEvents(evalStore);

export const mainStore = createStore(
  subscribeWithSelector((...a) => ({
    ...createSettingSlice(...a),
    ...createFenSlice(...a),
  }))
);

export const useMainStore = (selector) => useStore(mainStore, selector);
export const useEvalStore = (selector) => useStore(evalStore, selector);
