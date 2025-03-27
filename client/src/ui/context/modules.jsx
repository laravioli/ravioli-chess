import { useRef } from 'react';
import { useLocation } from 'react-router';
import { ModuleContext } from './hooks';
import { controller } from 'src/logic';
import { mainStore } from 'src/stores';

export const ModuleProvider = ({ children }) => {
  const moduleRef = useRef();
  const location = useLocation();

  if (!moduleRef.current) {
    moduleRef.current = controller.getModule();
    window.addEventListener('popstate', (event) => console.log(event));
  } else {
    const moduleUrl = controller.getModuleUrl(location);
    if (moduleUrl !== controller.getModule().name) {
      controller.setModule(moduleUrl, mainStore.getState().fen());
      moduleRef.current = controller.getModule();
    }
  }

  return (
    <ModuleContext.Provider value={moduleRef.current}>
      {children}
    </ModuleContext.Provider>
  );
};
