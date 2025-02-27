import { Chess } from 'chess.js';

export class GameComputer extends Chess {
  constructor({ info }) {
    super(info.fen);
    this.initialFen = info.fen;
  }

  newGame(fen) {
    this.initialFen = fen;
    this.load(fen);
  }
}
