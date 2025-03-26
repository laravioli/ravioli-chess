import { initSite } from './modules/site/site';
import { mainStore, evalStore } from 'src/stores';
import { MainController } from './modules/main/ctrl';

function getModuleUrl() {
  const url = new URL(window.location);
  return (
    url.pathname.split('/').filter((segment) => segment !== '')[0] ??
    import.meta.env.VITE_DEFAULT_MODULE
  );
}

function initModule() {
  const storeApi = (store) => ({
    get: store.getState,
    set: store.setState,
    subscribe: store.subscribe,
  });
  const stores = { ui: storeApi(mainStore), eval: storeApi(evalStore) };
  const moduleUrl = getModuleUrl();
  return new MainController(moduleUrl, stores);
}

initSite();
export const controller = initModule();
