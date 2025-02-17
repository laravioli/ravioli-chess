export class GameAnalyse {
  constructor({ chess, info, opts }) {
    this.chess = chess;
    this.info = info;
    this.newGame(opts.fen);
  }

  newGame(fen) {
    this.chess.load(fen);
  }

  disconnect() {
    this.chess.clear();
  }
}
