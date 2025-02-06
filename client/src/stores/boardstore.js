import chessBoard from 'chessboard';
import { chess } from './gamestore';

export const createBoardSlice = (set, get) => ({
  board: undefined,
  boardApi: {
    startBoard: () => get().board?.start(),

    clearBoard: () => get().board?.clear(),

    flipBoard: () => get().board?.flip(),

    getBoardFen: () => get().board?.fen(),

    setBoardPosition: (fen) => get().board?.position(fen, true),

    destroyBoard: () => {
      window.removeEventListener('resize', get().board?.resize);
      get().board?.destroy();
    },
  },

  setBoard: (div) => {
    let board = null;

    board = chessBoard(div, makeConfig(get));
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
  const state = get();

  if (state.mode === 'editor') {
    handlers['onDrop'] = (source, target, piece, newPos) => {
      get().setFenPositionFromEditor(get().board.objToFen(newPos));
    };
  }

  if (state.mode !== 'editor') {
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
      get().setFenSliceFromChess(chess);
      get().gameHistory.next(chess.history().at(-1));
    };
  }
  return handlers;
}
