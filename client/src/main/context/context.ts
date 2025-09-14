import { createContext } from 'react';
import type { GlobalStore, PageStore } from '../store/stores';
import type { LocalStorage } from '../store/localstorage';

export const GlobalStoreContext = createContext<GlobalStore | null>(null);
export const PageStoreContext = createContext<PageStore | null>(null);
export const LocalStorageContext = createContext<LocalStorage | null>(null);
export const DataContext = createContext<any>(null);
