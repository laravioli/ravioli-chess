import { createContext } from 'react';
import { rootStore } from '../store/rootstore';

function loadData() {
  const dataScript = document.getElementById('page-init-data');
  const data = dataScript && JSON.parse(dataScript.innerHTML);
  dataScript?.remove();
  return data;
}

export const DataContext = createContext(loadData());

export const StoreContext = createContext({
  analyseStore: rootStore.analyseStore,
  editorStore: rootStore.editorStore,
  playStore: rootStore.playStore,
  fenStore: rootStore.fenStore,
  uiStore: rootStore.uiStore,
});

export const PageContext = createContext(null);
