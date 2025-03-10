import { mainStore, evalStore } from '../stores';
import { MainController } from './main/ctrl';

const storeApi = (store) => ({
  get: store.getState,
  set: store.setState,
  subscribe: store.subscribe,
});

const stores = { ui: storeApi(mainStore), eval: storeApi(evalStore) };

export const controller = new MainController('analyse', stores);
