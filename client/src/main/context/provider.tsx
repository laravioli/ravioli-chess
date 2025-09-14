import { useRef, useEffect, useContext, type ReactNode } from 'react';
import { GlobalStoreContext, PageStoreContext, LocalStorageContext, DataContext } from './context';
import { makeGlobalStore, type GlobalStore, type PageStore } from '../store/stores';
import { makeLocalStorage, type LocalStorage } from '../store/localstorage';

export const GlobalStoreProvider = ({ children }) => {
  const storeRef = useRef<GlobalStore | null>(null);

  if (!storeRef.current) {
    const { cfg } = useContext(DataContext)!;
    storeRef.current = makeGlobalStore(cfg);
  }

  return <GlobalStoreContext.Provider value={storeRef.current}>{children}</GlobalStoreContext.Provider>;
};

type PageStoreProviderProps<T extends PageStore> = {
  children: ReactNode;
  factory: () => T;
};

export const PageStoreProvider = <T extends PageStore>({ children, factory }: PageStoreProviderProps<T>) => {
  const storeRef = useRef<T | null>(null);

  if (!storeRef.current) {
    storeRef.current = factory();
  }

  useEffect(() => {
    storeRef.current?.onLoad();
    window.history.replaceState({}, '');
    return () => storeRef.current?.onUnLoad();
  }, []);

  return <PageStoreContext.Provider value={storeRef.current}>{children}</PageStoreContext.Provider>;
};

export const LocalStorageProvider = ({ children }) => {
  const storeRef = useRef<LocalStorage | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeLocalStorage();
  }

  return <LocalStorageContext.Provider value={storeRef.current}>{children}</LocalStorageContext.Provider>;
};

export const DataProvider = ({ children }) => {
  const dataRef = useRef(null);
  const dataScript = document.getElementById('page-init-data');

  if (!dataRef.current) {
    dataRef.current = dataScript && JSON.parse(dataScript.innerHTML);
  }

  useEffect(() => dataScript?.remove(), []);

  return <DataContext.Provider value={dataRef.current}>{children}</DataContext.Provider>;
};
