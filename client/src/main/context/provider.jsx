import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import { PageStoreContext, DataContext } from './context';
import { rootStore, pageStoreRouter } from '../store/rootstore';
import { DEFAULT_POSITION } from 'chess.js';

export const PageStoreProvider = ({ children }) => {
  const storeRef = useRef(null);
  const location = useLocation();

  if (!storeRef.current) {
    const StoreCreator = pageStoreRouter(location.pathname);
    const state = location.state ?? { fen: DEFAULT_POSITION };
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
  const loadData = () => {
    const dataScript = document.getElementById('page-init-data');
    const data = dataScript && JSON.parse(dataScript.innerHTML);
    dataScript?.remove();
    return data;
  };

  if (!dataRef.current) {
    dataRef.current = loadData();
  }

  return (
    <DataContext.Provider value={dataRef.current}>
      {children}
    </DataContext.Provider>
  );
};
