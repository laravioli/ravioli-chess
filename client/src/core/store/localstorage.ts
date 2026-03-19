import { hydrateStore } from 'mobx-persist-store';

import { LocalEvalStorage } from '@/lib/eval/localstorage';
import { LocalLobbyStorage } from '@/lib/lobby/localstorage';

export interface LocalStorage {
  evalStorage: LocalEvalStorage;
  lobbyStorage: LocalLobbyStorage;
}

type StorageKey = keyof LocalStorage;
type StoreInstanceType<K extends StorageKey> = LocalStorage[K];

export function makeLocalStorage() {
  function autoHydrate<K extends StorageKey>(key: string, store: StoreInstanceType<K>) {
    const storageEventCallback = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        hydrateStore(store);
      }
    };

    window.addEventListener('storage', storageEventCallback);

    return () => {
      window.removeEventListener('storage', storageEventCallback);
    };
  }

  const localStorage: LocalStorage = {
    evalStorage: new LocalEvalStorage(),
    lobbyStorage: new LocalLobbyStorage(),
  };
  autoHydrate('eval-storage', localStorage.evalStorage);
  autoHydrate('lobby-storage', localStorage.lobbyStorage);

  return localStorage;
}
