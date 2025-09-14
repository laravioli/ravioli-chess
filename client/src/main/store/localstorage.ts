import { LocalEvalStorage } from 'src/lib/eval/localstorage';
import { LocalLobbyStorage } from 'src/lib/lobby/localstorage';
import { hydrateStore } from 'mobx-persist-store';

export interface LocalStorage {
  evalStorage: LocalEvalStorage;
  lobbyStorage: LocalLobbyStorage;
}

export let localStorage: LocalStorage | null = null;

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

  if (!localStorage) {
    localStorage = {
      evalStorage: new LocalEvalStorage(),
      lobbyStorage: new LocalLobbyStorage(),
    };
    autoHydrate('eval-storage', localStorage.evalStorage);
    autoHydrate('lobby-storage', localStorage.lobbyStorage);
  }

  return localStorage;
}
