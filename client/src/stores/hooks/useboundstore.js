import { create } from 'zustand';
import { createGameSlice } from '../gamestore';
import { createBoardSlice } from '../boardstore';
import { createControllerSlice } from '../controllerstore';
import { createFenSlice } from '../fenstore';

const createSelectors = (_store) => {
  let store = _store;
  store.use = {};
  for (let k of Object.keys(store.getState())) {
    store.use[k] = () => store((s) => s[k]);
  }

  return store;
};

export const useBoundStore = createSelectors(
  create((...a) => ({
    ...createGameSlice(...a),
    ...createBoardSlice(...a),
    ...createControllerSlice(...a),
    ...createFenSlice(...a),
  }))
);
