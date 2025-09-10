import { LocalEvalStorage } from 'src/lib/eval/localstorage';
import { LocalLobbyStorage } from 'src/lib/lobby/localstorage';
import { hydrateStore } from 'mobx-persist-store';

class LocalStorage {
  constructor() {
    this.evalStorage = new LocalEvalStorage();
    this.lobbyStorage = new LocalLobbyStorage();
  }
}

export const localStorage = new LocalStorage();

function autoHydrate(key, store) {
  const storageEventCallback = (e) => {
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
