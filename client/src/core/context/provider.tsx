import { useRef, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { wsReload } from '@/lib/socket';

import type { GlobalStore, PageStore } from '@/core/store/stores';
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

  const queryClient = useQueryClient();

  useEffect(() => {
    const dispose = globalStore.userStore.onAuthchange(() => {
      wsReload();
      queryClient.resetQueries();
    });

    globalStore.userStore.listen();

    return () => {
      dispose();
      globalStore.userStore.unlisten();
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

  //ensure factory is called only once
  //it may be a high density side-effect bomb
  if (!storeRef.current) {
    storeRef.current = factory();
  }

  useEffect(() => {
    (storeRef.current as PageStore).onLoad();
    window.history.replaceState({}, '');
    return () => {
      (storeRef.current as PageStore).onUnLoad();
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
