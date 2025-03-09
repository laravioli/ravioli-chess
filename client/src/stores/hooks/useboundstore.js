import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { createGameSlice } from '../slices/gameslice';
import { createBoardSlice } from '../slices/boardslice';
import { createModeSlice } from '../slices/modeslice';
import { createFenSlice } from '../slices/fenslice';
import { ChessController } from '../../logic/';
export const useBoundStore = create(
  subscribeWithSelector((...a) => ({
    ...createModeSlice(new ChessController('analyse'))(...a),
    ...createGameSlice(...a),
    ...createBoardSlice(...a),
    ...createFenSlice(...a),
  }))
);
