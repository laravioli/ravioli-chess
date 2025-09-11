import { useContext } from 'react';
import { DataContext, LocalStorageContext, GlobalStoreContext, PageStoreContext } from '../context/context';

/* Hooks to retrieve stores*/
export const useLocalStorage = () => useContext(LocalStorageContext);
export const useStore = () => useContext(GlobalStoreContext);
export const usePageStore = () => useContext(PageStoreContext);

/* Hook to retrieve ui data from the inital html*/
export const useHTMLData = () => {
  const { data } = useContext(DataContext);
  return data;
};
