import { createStore } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { recommendedThreads } from 'src/lib/eval/engine';

export const localStore = createStore(
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

withStorageDOMEvents(localStore);
