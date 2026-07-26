import { useContext } from 'react';
import { useLocation } from 'react-router';

import type { PageStore } from '@/core/app/deps';
import { DataContext, GlobalStoreContext, PageStoreContext } from '@/core/context/context';
import { PageConfig } from './boot/interface';

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

export const usePageInitCfg = () => {
  const { state } = useLocation();
  const payload = useContext(DataContext);

  if (state) return state as PageConfig;
  if (payload && payload?.config) return payload.config;

  throw new Error('missing initial page data');
};
