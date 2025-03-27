import { createContext, useContext } from 'react';

export const ModuleContext = createContext(null);
export const useModule = () => useContext(ModuleContext);
