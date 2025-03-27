import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import { ModuleContext } from './hooks';
import { controller } from 'src/logic';
import { mainStore } from 'src/stores';

export const ModuleProvider = ({ children }) => {
  const moduleRef = useRef();
  const location = useLocation();

  if (!moduleRef.current) {
    moduleRef.current = controller.getModule();
  }

  useEffect(() => {
    const moduleUrl = controller.getModuleUrl(location);
    if (moduleUrl !== controller.getModule().name) {
      controller.setModule(moduleUrl, mainStore.getState().fen());
      moduleRef.current = controller.getModule();
    }
  }, [location]);
  return (
    <ModuleContext.Provider value={moduleRef.current}>
      {children}
    </ModuleContext.Provider>
  );
};
