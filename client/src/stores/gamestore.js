import { DEFAULT_POSITION, Chess } from 'chess.js';
import { mode } from './controllerstore';

export const chess = new Chess();

export const createGameSlice = (set, get) => ({
  resetGame: () => chess.reset(),
  dispatchGame: (action) => set((state) => get()._reducerGame(state, action)),

  //wether to load or clear game based on action
  _reducerGame: (state, action) => {
    switch (action.mode) {
      case mode.game:
        chess.load(DEFAULT_POSITION);
        return state;
      case mode.continue:
        chess.load(get().fen());
        return state;

      case mode.editor:
        chess.clear();
        return state;

      default:
        return state;
    }
  },
});
