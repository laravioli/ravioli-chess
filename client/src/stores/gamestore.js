import { Chess } from 'chess.js';
import { mode } from './controllerstore';

export const chess = new Chess();

export const createGameSlice = (set, get) => ({
  gameHistory: [],
  gamePointer: 0,
  gameActions: {
    resetGame: () => {
      chess.reset();
    },

    updateGameHistory() {
      const state = get();
      if (state.gamePointer == state.gameHistory.length) {
        set((state) => ({
          gameHistory: chess.history(),
          gamePointer: state.gamePointer + 1,
        }));
      }
    },

    undoMove() {
      const state = get();
      if (state.gamePointer > 0) {
        chess.undo();
        state.boardApi.setBoardPosition(chess.fen());
        state.setFenSliceFromChess(chess);
        set((state) => ({ gamePointer: state.gamePointer - 1 }));
      }
    },

    redoMove() {
      const state = get();
      if (state.gamePointer < state.gameHistory.length) {
        console.log(state.gameHistory, state.gameHistory[state.gamePointer]);
        chess.move(state.gameHistory[state.gamePointer]);
        state.boardApi.setBoardPosition(chess.fen());
        state.setFenSliceFromChess(chess);
        set((state) => ({ gamePointer: state.gamePointer + 1 }));
      }
    },
  },

  dispatchNewGame: (action) => set((state) => get()._reducerNG(state, action)),
  _reducerNG: (state, action) => {
    switch (action.mode) {
      case mode.game:
        chess.reset();
        break;
      case mode.continue:
        chess.load(get().fen());
        break;

      case mode.editor:
        chess.clear();
        break;

      default:
        break;
    }
    return { gameHistory: [], gamePointer: 0 };
  },
});
