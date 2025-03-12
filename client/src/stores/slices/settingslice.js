import { DEFAULT_POSITION } from 'chess.js';

export const createSettingSlice = () => ({
  mode: 'analyse',

  config: {
    position: DEFAULT_POSITION,
    pieceTheme: '/static/frontend/images/wiki/{piece}.png',
    draggable: true,
    dropOffBoard: 'snapback',
    sparePieces: true,
    hideSparePieces: true,
  },
});
