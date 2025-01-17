import { DEFAULT_POSITION } from 'chess.js';
import chessBoard from 'chessboard';
import { mode } from './boardcontrollerstore';
import { chess } from './gamestore';

export const createBoardSlice = (set, get) => ({
  board: undefined,
  boardApi: {
    startBoard: () => get().board?.start(),

    clearBoard: () => get().board?.clear(),

    flipBoard: () => get().board?.flip(),

    getBoardFen: () => get().board?.fen(),

    destroyBoard: () => {
      window.removeEventListener('resize', get().board?.resize);
      get().board?.destroy();
    },

    setBoard: (div) => {
      let board = null;

      board = chessBoard(div, makeConfig(get));

      get().mode == mode.game
        ? chess.load(DEFAULT_POSITION)
        : chess.load(get().config.position);

      window.addEventListener('resize', board.resize);
      set({ board: board });
    },
  },
});

function makeConfig(get) {
  if (get().mode === mode.editor) {
    return get().config;
  } else {
    return { ...get().config, ...onMouseClick(get) };
  }
}

/* eslint-disable no-unused-vars */
function onMouseClick(get) {
  return {
    onDragStart(source, piece, position, orientation) {
      if (chess.isGameOver()) return false;
      if (
        (chess.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (chess.turn() === 'b' && piece.search(/^w/) !== -1)
      ) {
        return false;
      }
    },
    onDrop(source, target) {
      try {
        chess.move({
          from: source,
          to: target,
          promotion: 'q',
        });
      } catch (error) {
        return 'snapback';
      }
    },

    onSnapEnd() {
      get().board.position(chess.fen());
    },
  };
}
