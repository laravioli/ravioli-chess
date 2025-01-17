import { DEFAULT_POSITION, Chess } from 'chess.js';
export const chess = new Chess();

export const createGameSlice = () => ({
  newGame: (pos = DEFAULT_POSITION) => {
    chess.load(pos);
  },
  clearGame: () => chess.clear(),
});
