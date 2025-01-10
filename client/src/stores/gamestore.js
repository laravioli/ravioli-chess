import { DEFAULT_POSITION, Chess } from 'chess.js';

export const chess = new Chess();

export const createGameSlice = () => ({
  newGame: (position = DEFAULT_POSITION) => {
    chess.load(position);
  },
  clearGame: () => chess.clear(),
});
