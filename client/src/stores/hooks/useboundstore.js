import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { createGameSlice } from '../gamestore';
import { createBoardSlice } from '../boardstore';
import { createModeSlice } from '../modestore';
import { createFenSlice } from '../fenstore';

export const useBoundStore = create(
  subscribeWithSelector((...a) => ({
    ...createGameSlice(...a),
    ...createBoardSlice(...a),
    ...createModeSlice(...a),
    ...createFenSlice(...a),
  }))
);
