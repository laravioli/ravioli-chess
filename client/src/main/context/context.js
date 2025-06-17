import { createContext } from 'react';
import { localStorage } from '../store/localstorage';
import { rootStore } from '../store/rootstore';

export const DataContext = createContext(null);
export const LocalStorageContext = createContext({
  evalStorage: localStorage.evalStorage,
  lobbyStorage: localStorage.lobbyStorage,
});
export const StoreContext = createContext({
  uiStore: rootStore.uiStore,
});
export const PageStoreContext = createContext(null);
