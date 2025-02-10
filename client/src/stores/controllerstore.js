import { DEFAULT_POSITION } from 'chess.js';
import piecesUrl from '/images/base/bK.png';

export const createControllerSlice = (set, get) => ({
  mode: 'continue',

  //board config to control widget instanciation
  config: {
    position: DEFAULT_POSITION,
    pieceTheme: (piece) =>
      piecesUrl.replace(/\/([^/]+)\.png$/, `/${piece}.png`),
    draggable: true,
    dropOffBoard: 'snapback',
    sparePieces: true,
    hideSparePieces: true,
  },

  dispatchConf: (action) => set((state) => get()._reducerConf(state, action)),

  _reducerConf: (state, action) => {
    switch (action.mode) {
      case 'game':
        return {
          mode: 'game',
          config: {
            ...state.config,
            position: DEFAULT_POSITION,
            draggable: true,
            dropOffBoard: 'snapback',
            sparePieces: false,
          },
        };
      case 'continue':
        return {
          mode: 'continue',
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
