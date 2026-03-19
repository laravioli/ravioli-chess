import { createContext } from 'react';

import type { GlobalStore, PageStore } from '@/core/store/stores';
import type { LocalStorage } from '@/core/store/localstorage';
import type { ProvidedData } from '@/core/boot/interface';

export const GlobalStoreContext = createContext<GlobalStore | null>(null);
export const PageStoreContext = createContext<PageStore | null>(null);
export const LocalStorageContext = createContext<LocalStorage | null>(null);
export const DataContext = createContext<ProvidedData | null>(null);
