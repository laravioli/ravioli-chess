import { makePersistable, hydrateStore } from 'mobx-persist-store';

interface PersistOptions {
  sync: boolean;
}

export function persist(key: string, props: string[], options: PersistOptions = { sync: false }) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        makePersistable(this, {
          name: key,
          properties: props as any,
          storage: window.localStorage,
        });
        if (options.sync) {
          window.addEventListener('storage', (e) => {
            if (e.key !== key || e.storageArea !== localStorage || e.newValue === null) return;
            hydrateStore(this);
          });
        }
      }
    };
  };
}
