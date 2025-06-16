import { useRef, useEffect } from 'react';
import { PageStoreContext, DataContext } from './context';
import { rootStore, pageStoreRouter } from '../store/rootstore';
import { DEFAULT_POSITION } from 'chess.js';

export const PageStoreProvider = ({ children }) => {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    const StoreCreator = pageStoreRouter(window.location.pathname);
    const state = window.history.state.usr ?? { fen: DEFAULT_POSITION };
    storeRef.current = new StoreCreator(rootStore, state);
  }

  useEffect(() => {
    storeRef.current.onLoad();
    window.history.replaceState({}, '');
    return () => storeRef.current.onUnLoad();
  }, []);

  return (
    <PageStoreContext.Provider value={storeRef.current}>
      {children}
    </PageStoreContext.Provider>
  );
};

export const DataProvider = ({ children }) => {
  const dataRef = useRef(null);
  const dataScript = document.getElementById('page-init-data');
  const loadData = () => {
    const data = dataScript && JSON.parse(dataScript.innerHTML);
    return data;
  };

  if (!dataRef.current) {
    dataRef.current = loadData();
  }

  useEffect(() => () => dataScript?.remove(), []);

  return (
    <DataContext.Provider value={dataRef.current}>
      {children}
    </DataContext.Provider>
  );
};
