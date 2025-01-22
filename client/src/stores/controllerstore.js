import { DEFAULT_POSITION } from 'chess.js';

export const mode = Object.freeze({
  game: Symbol('game'),
  editor: Symbol('editor'),
  continue: Symbol('continue'),
});

export const createControllerSlice = (set, get) => ({
  currentMode: mode.continue,

  //board config to control widget instanciation
  config: {
    position: DEFAULT_POSITION,
    pieceTheme: './images/{piece}.png',
    draggable: true,
    dropOffBoard: 'snapback',
    sparePieces: true,
    hideSparePieces: true,
  },

  dispatchConf: (action) => set((state) => get()._reducerConf(state, action)),

  _reducerConf: (state, action) => {
    switch (action.mode) {
      case mode.game:
        return {
          currentMode: mode.game,
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
          currentMode: mode.continue,
          config: {
            ...state.config,
            position: get().fen(),
            draggable: true,
            dropOffBoard: 'snapback',
            sparePieces: true,
            hideSparePieces: true,
          },
        };
      case mode.editor:
        return {
          currentMode: mode.editor,
          config: {
            ...state.config,
            position: get().fen(),
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
