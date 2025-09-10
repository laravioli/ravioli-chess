import { useRef, useEffect, useContext } from "react";
import { GlobalStoreContext, PageStoreContext, DataContext } from "./context";
import { makeGlobalStore, pageStoreRouter } from "../store/stores";

export const GlobalStoreProvider = ({ children }) => {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    const cfg = useInitCfg();
    storeRef.current = makeGlobalStore(cfg);
  }

  return (
    <GlobalStoreContext.Provider value={storeRef.current}>
      {children}
    </GlobalStoreContext.Provider>
  );
};

export const PageStoreProvider = ({ children }) => {
  const storeRef = useRef(null);
  const globalStore = useContext(GlobalStoreContext);
  const cfg = useInitCfg();

  if (!storeRef.current) {
    const StoreCreator = pageStoreRouter(window.location.pathname);
    storeRef.current = new StoreCreator(globalStore, cfg);
  }

  useEffect(() => {
    storeRef.current.onLoad();
    window.history.replaceState({}, "");
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
  const dataScript = document.getElementById("page-init-data");

  if (!dataRef.current) {
    dataRef.current = dataScript && JSON.parse(dataScript.innerHTML);
  }

  useEffect(() => dataScript?.remove(), []);

  return (
    <DataContext.Provider value={dataRef.current}>
      {children}
    </DataContext.Provider>
  );
};

const useInitCfg = () => {
  const { cfg } = useContext(DataContext);
  const navCfg = window.history.state?.usr;

  return navCfg ?? cfg;
};
