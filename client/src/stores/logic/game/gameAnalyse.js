import { Chess } from 'chess.js';

export class GameAnalyse extends Chess {
  constructor(info) {
    super(info.fen);
    this.initialFen = info.fen;
    this.gameHistory = new History(this, info.history);
  }

  newGame(fen, history) {
    this.initialFen = fen;
    this.load(fen);
    this.gameHistory = new History(this, history);
  }
}

class History {
  constructor(game, history) {
    this.game = game;
    this.stack = [history ?? []];
    this.ptr = [history?.length ?? 0];
  }

  undo() {
    if (this.stack.length > 1 && this.ptr.at(-1) == 1) {
      this.stack.pop();
      this.ptr.pop();
      this.game.undo();
    } else if (this.ptr.at(-1) >= 1) {
      this.ptr.push(this.ptr.pop() - 1);
      this.game.undo();
    }
  }

  redo() {
    if (this.ptr.at(-1) >= 0 && this.ptr.at(-1) < this.stack.at(-1).length) {
      this.game.move(this.stack.at(-1)[this.ptr.at(-1)]);
      this.ptr.push(this.ptr.pop() + 1);
    }
  }

  reset(action) {
    if (this.stack.length > 1) {
      this.stack.splice(1);
    }
    this.ptr.splice(0);
    if (action == 'start') {
      this.game.load(this.game.initialFen);
      this.ptr.push(0);
    }
    if (action == 'end') {
      this.game.load(this.game.initialFen);
      this.stack[0].forEach((mv) => this.game.move(mv));
      this.ptr.push(this.stack[0].length);
    }
  }

  move() {
    if (this.ptr.at(-1) == this.stack.at(-1).length) {
      this.stack.at(-1).push(this.game.history().at(-1));
      this.ptr.push(this.ptr.pop() + 1);
    } else {
      this.stack.push([this.game.history().at(-1)]);
      this.ptr.push(1);
    }
  }
}
