import Cookies from 'js-cookie';

import type { Board, PieceSet, Preference } from '@/lib/api';

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

export function setPreference(preference: Preference) {
  if (preference.board) setBoardColor(preference.board);
  if (preference.pieceset) setPieceSet(preference.pieceset);
}

const PrefMap = new Map<string, Set<string>>([
  ['board', new Set(['wood', 'blue', 'blue2', 'brown'])],
  ['pieceset', new Set(['base', 'wiki'])],
]);

export function getAnonPreference(): Preference {
  const defaultPref: Preference = { board: 'wood', pieceset: 'base' };
  const anonCookie = Cookies.get('anon');

  if (!anonCookie) return defaultPref;

  let queryString = anonCookie.split(':')[0];
  const params = new URLSearchParams(queryString);
  const obj = {};

  for (const [key, value] of params.entries()) {
    if (PrefMap.get(key)?.has(value)) obj[key] = value;
  }

  return { ...defaultPref, ...obj };
}
