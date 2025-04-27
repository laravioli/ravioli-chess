import { useContext } from 'react';
import { useStore as u } from 'zustand';
import { DataContext, StoreContext } from '../context/context';
import { localStore } from 'src/main/store';

export const useInitData = () => useContext(DataContext);
export const useLocalStore = (selector) => u(localStore, selector);
export const useStore = () => useContext(StoreContext);
