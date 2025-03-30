import { useLocation } from 'react-router';
import { ModuleContext } from './hooks';
import { controller } from 'src/logic';

export const ModuleProvider = ({ children }) => {
  const location = useLocation();
  const module = controller.getModule(location.pathname);

  return (
    <ModuleContext.Provider value={module}>{children}</ModuleContext.Provider>
  );
};
