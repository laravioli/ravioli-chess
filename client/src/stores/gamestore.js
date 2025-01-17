import { DEFAULT_POSITION, Chess } from 'chess.js';
export const chess = new Chess();

export const createGameSlice = (get) => ({
  newGame: (pos = DEFAULT_POSITION) => {
    get().chess.load(pos);
  },
  clearGame: () => get().chess.clear(),
});
