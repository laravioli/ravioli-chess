import { DEFAULT_POSITION } from 'chess.js';

export const mode = Object.freeze({
  game: Symbol('game'),
  editor: Symbol('editor'),
  continue: Symbol('continue'),
});

export const createBoardControllerSlice = (set, get) => ({
  mode: mode.continue,

  config: {
    position: DEFAULT_POSITION,
    pieceTheme: './images/{piece}.png',
    draggable: true,
    dropOffBoard: 'snapback',
    sparePieces: true,
    hideSparePieces: true,
  },

  fen: DEFAULT_POSITION,

  castling: {
    woo: 'K',
    wooo: 'Q',
    boo: 'k',
    booo: 'q',
  },

  dispatchConf: (action) => set((state) => get()._reducerConf(state, action)),

  _reducerConf: (state, action) => {
    switch (action.mode) {
      case mode.game:
        return {
          mode: mode.game,
          config: {
            ...state.config,
            position: DEFAULT_POSITION,
            draggable: true,
            dropOffBoard: 'snapback',
            sparePieces: false,
          },
        };
      case mode.continue:
        return {
          mode: mode.continue,
          config: {
            ...state.config,
            position: get().boardApi.getBoardFen() + ' w KQkq - 0 1',
            draggable: true,
            dropOffBoard: 'snapback',
            sparePieces: true,
            hideSparePieces: true,
          },
        };
      case mode.editor:
        return {
          mode: mode.editor,
          config: {
            ...state.config,
            position: get().boardApi.getBoardFen() + ' w KQkq - 0 1',
            draggable: true,
            dropOffBoard: 'trash',
            sparePieces: true,
            hideSparePieces: false,
          },
        };
      default:
        return state;
    }
  },
});
