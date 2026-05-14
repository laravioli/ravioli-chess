import { useRef, useEffect, type ReactNode } from 'react';
import type { GlobalStore, PageStore } from '@/core/app/deps';
import type { ProvidedData } from '@/core/boot/interface';
import { GlobalStoreContext, PageStoreContext, DataContext } from './context';

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

  useEffect(() => {
    globalStore.userStore.onLoad();
    return () => {
      globalStore.userStore.onUnload();
    };
  }, []);

  return (
    <GlobalStoreContext.Provider value={storeRef.current}>{children}</GlobalStoreContext.Provider>
  );
};

type PageStoreProviderProps<T extends PageStore> = {
  children: ReactNode;
  factory: () => T;
};

export const PageStoreProvider = <T extends PageStore>({
  children,
  factory,
}: PageStoreProviderProps<T>) => {
  const storeRef = useRef<T | null>(null);
  const niceStrictMode = useRef(true);

  //ensure factory is called only once
  //it may be a high density side-effect bomb
  if (!storeRef.current) {
    storeRef.current = factory();
  }

  useEffect(() => {
    if (niceStrictMode.current) {
      (storeRef.current as PageStore).onLoad();
      window.history.replaceState({}, '');
    }
    return () => {
      niceStrictMode.current && (storeRef.current as PageStore).onUnLoad();
      niceStrictMode.current = false;
    };
  }, []);

  return <PageStoreContext.Provider value={storeRef.current}>{children}</PageStoreContext.Provider>;
};

export const DataProvider = ({
  children,
  data,
}: {
  children: React.ReactNode;
  data: ProvidedData;
}) => {
  const dataRef = useRef<ProvidedData | null>(null);

  if (!dataRef.current) {
    dataRef.current = data;
  }

  return <DataContext.Provider value={dataRef.current}>{children}</DataContext.Provider>;
};
