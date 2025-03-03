import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { createGameSlice } from '../gamestore';
import { createBoardSlice } from '../boardstore';
import { createModeSlice } from '../modestore';
import { createFenSlice } from '../fenstore';
import gameCtrl from '../logic/game/ctrl';

export const useBoundStore = create(
  subscribeWithSelector((...a) => ({
    ...createGameSlice(gameCtrl)(...a),
    ...createBoardSlice(...a),
    ...createModeSlice(...a),
    ...createFenSlice(...a),
  }))
);
