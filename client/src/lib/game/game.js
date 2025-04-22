import { Chess } from 'chess.js';
import { observable, computed, action } from 'mobx';

export class Game {
  @observable accessor currentMove;

  constructor(fen) {
    this._chess = new Chess(fen);
    Object.getOwnPropertyNames(Chess.prototype).forEach((key) => {
      if (key !== 'constructor' && !(key in this)) {
        // Forward the method from Chess if not already defined in Game
        this[key] = (...args) => this._chess[key](...args);
      }
    });
    this.setRoot(fen);
  }

  @computed
  get line() {
    let move = this.currentMove;
    const moves = [];
    while (move.parent) {
      moves.unshift(move);
      move = move.parent;
    }
    moves.unshift(move);
    return moves;
  }

  setRoot(fen) {
    const ply =
      (this._chess.turn() == 'w' ? 0 : 1) + (this._chess.moveNumber() - 1) * 2;
    this.currentMove = this.root = {
      parent: null,
      ply,
      fen,
      outcome: this._chess.isGameOver(),
      children: [],
    };
  }

  @action
  load(fen) {
    this._chess.load(fen);
    this.setRoot(fen);
  }

  @action
  move(source, target) {
    this._chess.move({
      from: source,
      to: target,
      promotion: 'q',
    });
  }

  @action
  jump(action) {
    switch (action) {
      case 'move':
        this.appendMove();
        break;
      case 'undo':
        this.undo();
        break;
      case 'redo':
        this.redo();
        break;
      case 'start':
        this.start();
        break;
      case 'end':
        this.end();
        break;
    }
  }

  @action
  appendMove() {
    const info = this._chess.history({ verbose: true }).at(-1);
    let move = this.currentMove.children.find((move) => move.uci === info.lan);

    if (!move) {
      move = {
        parent: this.currentMove, //circular ref
        ply: this.currentMove.ply + 1,
        fen: this._chess.fen(),
        san: info.san,
        uci: info.lan,
        outcome: this._chess.isGameOver(),
        children: [],
      };
      this.currentMove.children.push(move);
    }
    this.currentMove = move;
  }

  @action
  undo() {
    if (this.currentMove.parent) {
      this.currentMove = this.currentMove.parent;
      this._chess.undo();
    }
  }

  @action
  redo() {
    if (this.currentMove.children.length > 0) {
      this.currentMove = this.currentMove.children[0];
      this._chess.move(this.currentMove.san);
    }
  }

  @action
  start() {
    this.currentMove = this.root;
    this._chess.load(this.currentMove.fen);
  }

  @action
  end() {
    let move = this.root;
    this._chess.load(move.fen);

    while (move.children.length > 0) {
      move = move.children[0];
      this._chess.move(move.san);
    }
    this.currentMove = move;
  }
}
