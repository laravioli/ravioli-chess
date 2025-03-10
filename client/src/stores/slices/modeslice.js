import { DEFAULT_POSITION } from 'chess.js';
import piecesUrl from '/images/base/bK.png';

export const createModeSlice = () => ({
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
});
