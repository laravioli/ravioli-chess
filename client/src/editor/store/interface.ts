export interface EditorOpts {
  orientation: Color;
  fen: FEN;
}

export interface EditorSettings {
  socketReceive: (t: string, d: any) => void;
}

export type CastlingSide = 'K' | 'Q' | 'k' | 'q';

export type Castlings = {
  [key in CastlingSide]: boolean;
};
