import type { Castlings } from './interface';

const CASTLINGS = ['K', 'Q', 'k', 'q'] as const;

export const castlingsToFen = (castling: Castlings) => {
  let fen = '';
  for (const toggle of CASTLINGS) {
    if (castling[toggle]) fen += toggle;
  }
  return fen;
};
