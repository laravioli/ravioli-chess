export interface AnalyseOpts {
  orientation: Color;
  fen: FEN;
}

export interface JustCaptured extends Piece {
  promoted?: boolean;
}
