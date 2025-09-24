import { useRef, useEffect, type ReactNode } from 'react';
import { GlobalStoreContext, PageStoreContext, LocalStorageContext, DataContext } from './context';
import type { GlobalStore, PageStore } from '../store/stores';
import type { LocalStorage } from '../store/localstorage';
import type { ProvidedData } from '../boot/interface';

export const LocalStorageProvider = ({
  children,
  localStorage,
}: {
  children: React.ReactNode;
  localStorage: LocalStorage;
}) => {
  const storeRef = useRef<LocalStorage | null>(null);

  if (!storeRef.current) {
    storeRef.current = localStorage;
  }

  return <LocalStorageContext.Provider value={storeRef.current}>{children}</LocalStorageContext.Provider>;
};

export const GlobalStoreProvider = ({
  children,
  globalStore,
}: {
  children: React.ReactNode;
  globalStore: GlobalStore;
}) => {
  const storeRef = useRef<GlobalStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = globalStore;
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

export const DataProvider = ({ children, data }: { children: React.ReactNode; data: ProvidedData }) => {
  const dataRef = useRef<ProvidedData | null>(null);

  if (!dataRef.current) {
    dataRef.current = data;
  }

  return <DataContext.Provider value={dataRef.current}>{children}</DataContext.Provider>;
};
