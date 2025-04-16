import { useLocation } from 'react-router';
import { ModuleContext, ProxyContext } from './context';
import { controller } from 'src/main/logic';
import { proxy } from 'valtio';

export const ModuleProvider = ({ children }) => {
  const location = useLocation();
  const module = controller.getModule(location.pathname);
  const proxymod = proxy(module);
  console.log(proxymod);

  return (
    <ModuleContext.Provider value={module}>
      <ProxyContext.Provider value={proxymod}>{children}</ProxyContext.Provider>
    </ModuleContext.Provider>
  );
};
