import type { Board, PieceSet, PreferenceOut } from '@/lib/api';

const pieceVars = [
  ['---white-pawn', 'wP'],
  ['---black-pawn', 'bP'],
  ['---white-knight', 'wN'],
  ['---black-knight', 'bN'],
  ['---white-bishop', 'wB'],
  ['---black-bishop', 'bB'],
  ['---white-rook', 'wR'],
  ['---black-rook', 'bR'],
  ['---white-queen', 'wQ'],
  ['---black-queen', 'bQ'],
  ['---white-king', 'wK'],
  ['---black-king', 'bK'],
];

function getImageUrl(theme: PieceSet, piece: string) {
  const base = import.meta.env.BASE_URL;
  return `${base.replace(/\/+$/, '')}/images/pieces/${theme}/${piece}.png`;
}

function pieceVarRules(theme: PieceSet) {
  for (const [varName, fileName] of pieceVars) {
    const url = getImageUrl(theme, fileName);
    document.body.style.setProperty(varName, `url(${url})`);
  }
}

export function setPieceSet(theme: PieceSet) {
  document.body.dataset['pieceset'] = theme;
  pieceVarRules(theme);
}

export function setBoardColor(color: Board) {
  document.body.dataset['board'] = color;
}

export function setPreference(preference: PreferenceOut) {
  if (preference.board) setBoardColor(preference.board);
  if (preference.pieceset) setPieceSet(preference.pieceset);
}
