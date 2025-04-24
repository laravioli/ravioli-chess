import { useContext } from 'react';
import { useStore } from 'zustand';
import { DataContext, ModuleContext } from '../context/context';
import { localStore } from 'src/main/store';

export const useInitData = () => useContext(DataContext);
export const useModule = () => useContext(ModuleContext);
export const useLocalStore = (selector) => useStore(localStore, selector);
