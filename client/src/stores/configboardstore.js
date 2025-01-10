import { DEFAULT_POSITION } from 'chess.js';

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
          mode: action.mode,
          config: {
            ...state.config,
            position:
              action.mode === mode.game
                ? DEFAULT_POSITION
                : get().boardPosition() + ' w KQkq - 0 1',
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
            position: get().boardPosition() + ' w KQkq - 0 1',
            draggable: true,
            dropOffBoard: 'trash',
            sparePieces: true,
          },
        };
      default:
        return state;
    }
  },
});
