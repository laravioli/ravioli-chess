import { createContext } from 'react';
import { rootStore } from '../store/rootstore';

export const DataContext = createContext(null);
export const StoreContext = createContext({
  uiStore: rootStore.uiStore,
});

export const PageStoreContext = createContext(null);
