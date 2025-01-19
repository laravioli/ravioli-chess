import { DEFAULT_POSITION } from 'chess.js';
import chessBoard from 'chessboard';
import { mode } from './controllerstore';
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
  },

  setBoard: (div) => {
    let board = null;

    board = chessBoard(div, makeConfig(get));

    get().mode === mode.game
      ? chess.load(DEFAULT_POSITION)
      : chess.load(get().fen);

    window.addEventListener('resize', board.resize);
    set({ board: board });
  },
});

function makeConfig(get) {
  return { ...get().config, ...onMouseClick(get) };
}

/* eslint-disable no-unused-vars */
function onMouseClick(get) {
  const handlers = {};

  if (get().mode !== mode.game)
    handlers['onChange'] = (oldPos, newPos) => {
      get().setFen(get().board.objToFen(newPos));
    };

  if (get().mode !== mode.editor) {
    handlers['onDragStart'] = (source, piece, position, orientation) => {
      if (chess.isGameOver()) return false;
      if (
        (chess.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (chess.turn() === 'b' && piece.search(/^w/) !== -1)
      ) {
        return false;
      }
    };

    handlers['onDrop'] = (source, target) => {
      try {
        chess.move({
          from: source,
          to: target,
          promotion: 'q',
        });
      } catch (error) {
        return 'snapback';
      }
    };

    handlers['onSnapEnd'] = () => {
      get().board.position(chess.fen());
    };
  }
  return handlers;
}
