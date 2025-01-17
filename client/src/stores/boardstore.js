import { DEFAULT_POSITION } from 'chess.js';
import chessBoard from 'chessboard';
import { useBoundStore } from './hooks/useboundstore';
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

      board = chessBoard(div, makeconfig());

      get().mode == mode.game
        ? chess.load(DEFAULT_POSITION)
        : chess.load(get().config.position);

      window.addEventListener('resize', board.resize);
      set({ board: board });
    },
  },
});

function makeconfig() {
  const config = useBoundStore.getState().config;
  const handler = onMouseEvent();
  if (useBoundStore.getState().mode === mode.editor) return config;
  return { ...config, ...handler };
}

/* eslint-disable no-unused-vars */
function onMouseEvent() {
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
      const board = useBoundStore.getState().board;
      board.position(chess.fen());
    },
  };
}
