import { Chess } from 'chess.js';

export class Analyse {
  constructor(info) {
    this.initialFen = info.fen;
    this.game = new Game(info.fen);
  }

  clear() {
    this.initialFen = undefined;
    this.game = undefined;
  }

  loadPosition(fen) {
    if (!this.game) this.game = new Game(fen);
    this.initialFen = fen;
    this.game.load(fen);
  }

  jump(action) {
    if (action === 'move') this.game.appendMove();
    else if (action === 'undo') this.game.undoMove();
    else if (action === 'redo') this.game.redoMove();
    else if (action === 'start') this.game.goStart();
    else if (action === 'end') this.game.goEnd();
  }
}

class Game {
  constructor(fen) {
    this.chess = new Chess(fen);
    this.root = { parent: null, ply: 0, fen, children: [] };
    this.currentMove = this.root;
  }

  load(fen) {
    this.currentMove = this.root = { parent: null, ply: 0, fen, children: [] };
    this.chess.load(fen);
  }

  getCurrentMove() {
    return this.currentMove;
  }

  get moveList() {
    let move = this.currentMove;
    const moves = [];
    while (move.parent) {
      moves.unshift(move);
      move = move.parent;
    }
    moves.unshift(move);
    return moves;
  }

  appendMove() {
    const newMove = {
      parent: this.currentMove,
      ply: this.currentMove.ply + 1,
      fen: this.chess.fen(),
      san: this.chess.history({ verbose: true }).at(-1).san,
      uci: this.chess.history({ verbose: true }).at(-1).lan,
      children: [],
    };
    this.currentMove.children.push(newMove);
    this.currentMove = newMove;
  }

  undoMove() {
    if (this.currentMove.parent) {
      this.currentMove = this.currentMove.parent;
      this.chess.undo();
    }
  }

  redoMove() {
    if (this.currentMove.children.length > 0) {
      this.currentMove = this.currentMove.children[0];
      this.chess.move(this.currentMove.san);
    }
  }

  goStart() {
    this.currentMove = this.root;
    this.chess.load(this.currentMove.fen);
  }

  goEnd() {
    if (this.currentMove !== this.root) {
      this.currentMove = this.root;
      this.chess.load(this.root.fen);
    }
    while (this.currentMove.children.length > 0) {
      this.currentMove = this.currentMove.children[0];
      this.chess.move(this.currentMove.san);
    }
  }
}
