import { useContext } from 'react';
import { DataContext, LocalStorageContext, GlobalStoreContext, PageStoreContext } from '../context/context';
import type { PageStore } from '../store/stores';

/* Hooks to retrieve stores*/
export const useLocalStorage = () => useContext(LocalStorageContext);
export const useGlobalStore = () => {
  const store = useContext(GlobalStoreContext);
  if (!store) throw new Error('useGlobalStore hook must be use within a GlobalStoreProvider');
  return store;
};

export const usePageStore = <T extends PageStore>(): T => {
  const store = useContext(PageStoreContext);
  if (!store) throw new Error('usePageStore hook must be use within a PageStoreProvider');
  return store as T;
};

/* Hook to retrieve data from the inital html*/
export const useHTMLData = () => {
  const { data } = useContext(DataContext);
  return data;
};

export const useInitCfg = () => {
  const { cfg } = useContext(DataContext);
  const navCfg = window.history.state?.usr;

  return navCfg ?? cfg;
};
