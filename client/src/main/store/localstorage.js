import { LocalEvalStorage } from 'src/lib/eval/localstorage';
import { hydrateStore } from 'mobx-persist-store';

class LocalStorage {
  constructor() {
    this.evalStorage = new LocalEvalStorage();
  }
}

export const localStorage = new LocalStorage();

(function (store) {
  const storageEventCallback = (e) => {
    if (e.key === 'eval-storage' && e.newValue) {
      hydrateStore(store);
    }
  };

  window.addEventListener('storage', storageEventCallback);

  return () => {
    window.removeEventListener('storage', storageEventCallback);
  };
})(localStorage.evalStorage);
