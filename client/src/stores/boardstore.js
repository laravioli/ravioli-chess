import { create } from 'zustand';
import chessBoard from 'chessboard';
import { DEFAULT } from '../configs/boardconfig';

export const useBoardStore = create((set, get) => ({
  widget: null,
  config: DEFAULT,
  setWidget: (div) => set({ widget: chessBoard(div, get().config) }),
  destroyWidget: () => {
    get().widget?.destroy();
  },
  setConfig: (config) => set({ config: config }),
}));
