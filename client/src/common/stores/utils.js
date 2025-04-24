export { validateFen } from 'chess.js';

export const getCastlingRights = (castling) => {
  const cr = Object.entries(castling)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join('');
  return cr === '' ? '-' : cr;
};

export const isValidInput = (input) => {
  const validation = validateFen(input);
  const validErrors = [
    'Invalid FEN: some pawns are on the edge rows',
    'Invalid FEN: missing white king',
    'Invalid FEN: missing black king',
  ];
  if (validation.ok || validErrors.includes(validation.error)) {
    return true;
  } else {
    return false;
  }
};
