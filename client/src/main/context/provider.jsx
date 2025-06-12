import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import { PageStoreContext } from './context';
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
    return () => storeRef.current.onUnLoad();
  }, []);

  return (
    <PageStoreContext.Provider value={storeRef.current}>
      {children}
    </PageStoreContext.Provider>
  );
};
