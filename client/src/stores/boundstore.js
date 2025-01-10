import { create } from 'zustand';
import { createGameSlice } from './gamestore';
import { createConfigSlice } from './configboardstore';
import { createBoardSlice } from './boardstore';

export const useBoundStore = create((...a) => ({
  ...createGameSlice(...a),
  ...createConfigSlice(...a),
  ...createBoardSlice(...a),
}));
