export interface EditorOpts {
  orientation: Color;
  fen: FEN;
}

export type CastlingSide = 'K' | 'Q' | 'k' | 'q';

export type Castlings = {
  [key in CastlingSide]: boolean;
};
