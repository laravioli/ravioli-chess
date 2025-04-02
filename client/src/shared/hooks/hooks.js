import { useContext } from 'react';
import { useStore } from 'zustand';
import { DataContext, ModuleContext } from '../context/context';
import { mainStore, localStore } from 'src/main/store';

export const useInitData = () => useContext(DataContext);
export const useModule = () => useContext(ModuleContext);
export const useMainStore = (selector) => useStore(mainStore, selector);
export const useLocalStore = (selector) => useStore(localStore, selector);
