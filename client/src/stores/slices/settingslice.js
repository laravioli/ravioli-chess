import { DEFAULT_POSITION } from 'chess.js';
import piecesUrl from '/images/wiki/bK.png';

export const createSettingSlice = () => ({
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
