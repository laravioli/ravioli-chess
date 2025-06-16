import { createStore } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { recommendedThreads } from 'src/lib/eval/engine';

const createLocalStore = (store, name) => {
  const localStore = createStore(
    subscribeWithSelector(
      persist(store, {
        name: name,
      })
    )
  );

  (function (store) {
    const storageEventCallback = (e) => {
      if (e.key === store.persist.getOptions().name && e.newValue) {
        store.persist.rehydrate();
      }
    };

    window.addEventListener('storage', storageEventCallback);

    return () => {
      window.removeEventListener('storage', storageEventCallback);
    };
  })(localStore);

  return localStore;
};

export const localStore = createLocalStore(
  () => ({
    multipv: 1,
    searchms: 3000,
    threads: recommendedThreads(),
    hashsize: 16,
  }),
  'eval-storage'
);
