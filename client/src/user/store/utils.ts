import Cookies from 'js-cookie';
import type { BoardEnum, PiecesetEnum, Profile } from 'src/lib/api';

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

function getImageUrl(theme: PiecesetEnum, piece: string) {
  const base = import.meta.env.BASE_URL;
  return `${base.replace(/\/+$/, '')}/images/pieces/${theme}/${piece}.png`;
}

function pieceVarRules(theme: PiecesetEnum) {
  for (const [varName, fileName] of pieceVars) {
    const url = getImageUrl(theme, fileName);
    document.body.style.setProperty(varName, `url(${url})`);
  }
}

export function setPieceSet(theme: PiecesetEnum) {
  document.body.dataset['pieceset'] = theme;
  pieceVarRules(theme);
}

export function setBoardColor(color: BoardEnum) {
  document.body.dataset['board'] = color;
}

export function setProfile(profile: Profile) {
  if (profile.board) setBoardColor(profile.board);
  if (profile.pieceset) setPieceSet(profile.pieceset);
}

const ProfileMap = new Map<string, Set<string>>([
  ['board', new Set(['wood', 'blue', 'blue2', 'brown'])],
  ['pieceset', new Set(['base', 'wiki'])],
]);

export function getAnonProfile(): Profile {
  const defaultProfile: Profile = { board: 'wood', pieceset: 'base' };
  const anonCookie = Cookies.get('anon');

  if (!anonCookie) return defaultProfile;

  let queryString = anonCookie.split(':')[0];
  const params = new URLSearchParams(queryString);
  const obj = {};

  for (const [key, value] of params.entries()) {
    if (ProfileMap.get(key)?.has(value)) obj[key] = value;
  }

  return { ...defaultProfile, ...obj };
}
