import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { createGameSlice } from '../slices/gameslice';
import { createBoardSlice } from '../slices/boardslice';
import { createModeSlice } from '../slices/modeslice';
import { createFenSlice } from '../slices/fenslice';
import { gameCtrl } from '../logic/game/ctrl';

export const useBoundStore = create(
  subscribeWithSelector((...a) => ({
    ...createGameSlice(gameCtrl)(...a),
    ...createBoardSlice(...a),
    ...createModeSlice(...a),
    ...createFenSlice(...a),
  }))
);
