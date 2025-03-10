import { DEFAULT_POSITION } from 'chess.js';
import piecesUrl from '/images/base/bK.png';

export const createModeSlice = (mode) => (set, get) => ({
  mode: 'analyse',

  config: {
    position: DEFAULT_POSITION,
    pieceTheme: (piece) =>
      piecesUrl.replace(/\/([^/]+)\.png$/, `/${piece}.png`),
    draggable: true,
    dropOffBoard: 'snapback',
    sparePieces: true,
    hideSparePieces: true,
  },

  switchMode: (action) => set((state) => get()._reducerMode(state, action)),

  _reducerMode: (state, action) => {
    mode.setMode(action.mode, get().fen());
    switch (action.mode) {
      case 'computer':
      case 'online':
        return {
          mode: action.mode,
          config: {
            ...state.config,
            position: DEFAULT_POSITION,
            draggable: true,
            dropOffBoard: 'snapback',
            sparePieces: false,
          },
        };
      case 'analyse':
        return {
          mode: 'analyse',
          config: {
            ...state.config,
            position: get().fen(),
            draggable: true,
            dropOffBoard: 'snapback',
            sparePieces: true,
            hideSparePieces: true,
          },
        };
      case 'editor':
        return {
          mode: 'editor',
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
