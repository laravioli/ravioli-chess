import { useContext } from 'react';
import {
  DataContext,
  LocalStorageContext,
  StoreContext,
  PageStoreContext,
} from '../context/context';

export const useInitData = () => useContext(DataContext);
export const useLocalStorage = () => useContext(LocalStorageContext);
export const useStore = () => useContext(StoreContext);
export const usePageStore = () => useContext(PageStoreContext);
