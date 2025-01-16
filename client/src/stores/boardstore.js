import { DEFAULT_POSITION } from 'chess.js';
import { chess } from './gamestore';
import chessBoard from 'chessboard';
import { mode } from './boardcontrollerstore';

export const createBoardSlice = (set, get) => ({
  board: undefined,
  boardApi: {
    startBoard: () => get().board?.start(),

    clearBoard: () => get().board?.clear(),

    flipBoard: () => get().board?.flip(),

    getBoardFen: () => get().board?.fen(),

    destroyBoard: () => {
      window.removeEventListener('resize', get().board.resize);
      get().board?.destroy();
    },

    /* eslint-disable no-unused-vars */
    setBoard: (div) => {
      const configMode = get().mode;
      let board = null;

      if (configMode === mode.editor) {
        board = chessBoard(div, get().config);
      }

      if (configMode === mode.game || configMode === mode.continue) {
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

        configMode == mode.game
          ? chess.load(DEFAULT_POSITION)
          : chess.load(get().config.position);
      }

      window.addEventListener('resize', board.resize);
      set({ board: board });
    },
  },
});

function makeConfig(conf) {
  return {};
}
