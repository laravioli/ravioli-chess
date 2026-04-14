export interface AnalyseOpts {
  orientation: Color;
  fen: FEN;
}

export interface AnalyseSettings {
  socketReceive: (t: string, d: any) => void;
}

export interface JustCaptured extends Piece {
  promoted?: boolean;
}
