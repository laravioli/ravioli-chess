import { create } from 'zustand';
import { createGameSlice } from './gamestore';
import { createConfigSlice } from './configboardstore';
import { createBoardSlice } from './boardstore';

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
    ...createConfigSlice(...a),
    ...createBoardSlice(...a),
  }))
);
