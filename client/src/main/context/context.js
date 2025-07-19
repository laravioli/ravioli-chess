import { createContext } from "react";
import { localStorage } from "../store/localstorage";

export const GlobalStoreContext = createContext(null);
export const PageStoreContext = createContext(null);
export const LocalStorageContext = createContext({
  evalStorage: localStorage.evalStorage,
  lobbyStorage: localStorage.lobbyStorage,
});
export const DataContext = createContext(null);
