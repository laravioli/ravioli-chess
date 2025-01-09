import { chess } from './gamestore';
import { DEFAULT_POSITION } from 'chess.js';
import chessBoard from 'chessboard';

export const mode = Object.freeze({
  game: Symbol('game'),
  editor: Symbol('editor'),
  continue: Symbol('continue'),
});

export const createConfigSlice = (set, get) => ({
  mode: mode.game,
  config: {
    position: DEFAULT_POSITION,
    pieceTheme: './images/{piece}.png',
    draggable: true,
    dropOffBoard: 'snapback',
    sparePieces: false,
  },
  dispatchConf: (action) => set((state) => get()._reducerConf(state, action)),
  _reducerConf: (state, action) => {
    switch (action.mode) {
      case mode.game:
      case mode.continue:
        return {
          mode: mode.game,
          config: {
            ...state.config,
            position:
              action.mode === mode.game
                ? DEFAULT_POSITION
                : get().boardPosition(),
            draggable: true,
            dropOffBoard: 'snapback',
            sparePieces: false,
          },
        };
      case mode.editor:
        return {
          mode: mode.editor,
          config: {
            ...state.config,
            position: get().boardPosition(),
            draggable: true,
            dropOffBoard: 'trash',
            sparePieces: true,
          },
        };
      default:
        return state;
    }
  },
  /* eslint-disable no-unused-vars */
  setBoard: (div) => {
    const mode = get().mode;
    let board = null;

    if (mode === mode.editor) {
      board = chessBoard(div, get().config);
    }

    if (mode === mode.game || mode === mode.continue) {
      const onDragStart = (source, piece, position, orientation) => {
        if (chess.isGameOver()) return false;
        if (
          (chess.turn() === 'w' && piece.search(/^b/) !== -1) ||
          (chess.turn() === 'b' && piece.search(/^w/) !== -1)
        ) {
          return false;
        }
      };

      const onDrop = (source, target) => {
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

      const onSnapEnd = () => {
        board.position(chess.fen());
      };
      board = chessBoard(div, {
        ...get().config,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
      });
      mode === mode.game
        ? chess.load(DEFAULT_POSITION)
        : chess.load(board.fen() + ' w KQkq - 0 1');
    }
    window.addEventListener('resize', board.resize);
    set({ board: board });
  },
});
