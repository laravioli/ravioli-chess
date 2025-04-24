import { Fen } from './fen';
import { Board } from './board';

export class CommonStore {
  constructor(fen) {
    this.fen = new Fen(fen);
    this.board = new Board();
  }
}
