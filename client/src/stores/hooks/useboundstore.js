import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { createGameSlice } from '../slices/gameslice';
import { createBoardSlice } from '../slices/boardslice';
import { createModeSlice } from '../slices/modeslice';
import { createFenSlice } from '../slices/fenslice';
import { mode } from '../logic';

export const useBoundStore = create(
  subscribeWithSelector((...a) => ({
    ...createModeSlice(mode)(...a),
    ...createGameSlice(...a),
    ...createBoardSlice(...a),
    ...createFenSlice(...a),
  }))
);
