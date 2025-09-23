import { LocalEvalStorage } from 'src/lib/eval/localstorage';
import { LocalLobbyStorage } from 'src/lib/lobby/localstorage';
import { makePersistable, hydrateStore } from 'mobx-persist-store';

export interface LocalStorage {
  evalStorage: LocalEvalStorage;
  lobbyStorage: LocalLobbyStorage;
}

type StorageKey = keyof LocalStorage;
type StoreInstanceType<K extends StorageKey> = LocalStorage[K];

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

//todo create a generic function

export const makeLobbyStorage = async () => {
  const lobbyStorage = new LocalLobbyStorage();
  await makePersistable(lobbyStorage, {
    name: 'lobby-storage',
    properties: ['anon', 'timeMode', 'time', 'increment', 'aiLevel', 'side'],
    storage: window.localStorage,
  });
  autoHydrate('lobby-storage', lobbyStorage);
  return lobbyStorage;
};

export const makeEvalStorage = async () => {
  const lobbyStorage = new LocalEvalStorage();
  await makePersistable(lobbyStorage, {
    name: 'eval-storage',
    properties: ['multipv', 'searchms', 'threads', 'hashsize', 'sri', 'disable'],
    storage: window.localStorage,
  });
  autoHydrate('lobby-storage', lobbyStorage);
  return lobbyStorage;
};

/*makePersistable(this, {
  name: 'lobby-storage',
  properties: ['anon', 'timeMode', 'time', 'increment', 'aiLevel', 'side'],
  storage: window.localStorage,
  debugMode: true,
});

makePersistable(this, {
  name: 'lobby-storage',
  properties: ['anon', 'timeMode', 'time', 'increment', 'aiLevel', 'side'],
  storage: window.localStorage,
  debugMode: true,
});*/
