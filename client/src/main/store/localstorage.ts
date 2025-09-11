import { LocalEvalStorage } from 'src/lib/eval/localstorage';
import { LocalLobbyStorage } from 'src/lib/lobby/localstorage';
import { hydrateStore } from 'mobx-persist-store';

type StorageKey = keyof LocalStorage;
type StoreInstanceType<K extends StorageKey> = LocalStorage[K];

class LocalStorage {
  evalStorage: LocalEvalStorage;
  lobbyStorage: LocalLobbyStorage;
  constructor() {
    this.evalStorage = new LocalEvalStorage();
    this.lobbyStorage = new LocalLobbyStorage();
  }
}

export const localStorage = new LocalStorage();

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

autoHydrate('eval-storage', localStorage.evalStorage);
autoHydrate('lobby-storage', localStorage.lobbyStorage);
