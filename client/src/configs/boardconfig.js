import { DEFAULT_POSITION } from 'chess.js';
export const EDITOR = {
  type: 'editor',
  position: DEFAULT_POSITION,
  pieceTheme: './images/{piece}.png',
  draggable: true,
  dropOffBoard: 'trash',
  sparePieces: true,
  showNotation: true,
};

export const GAME = {
  type: 'game',
  position: DEFAULT_POSITION,
  pieceTheme: './images/{piece}.png',
  draggable: true,
  showNotation: true,
};
