import { Chess } from 'chess.js';
import { observable, computed, action, makeAutoObservable } from 'mobx';

export class Game {
  @observable accessor currentMove;

  constructor(fen) {
    this._chess = new Chess(fen);
    Object.getOwnPropertyNames(Chess.prototype).forEach((key) => {
      if (key !== 'constructor' && typeof Chess.prototype[key] === 'function') {
        if (!this[key]) {
          this[key] = (...args) => this._chess[key](...args);
        }
      }
    });
    this.setRoot(fen);
  }

  @computed
  get line() {
    let move = this.currentMove;
    const moves = [];
    while (move) {
      moves.push(move);
      move = move.parent;
    }
    return moves.reverse();
  }

  setRoot(fen) {
    const ply =
      (this._chess.turn() == 'w' ? 0 : 1) + (this._chess.moveNumber() - 1) * 2;
    this.root = new Move({
      parent: null,
      ply,
      fen,
      san: null,
      uci: null,
      outcome: this._chess.isGameOver(),
    });
    this.currentMove = this.root;
  }

  @action
  load(fen) {
    this._chess.load(fen);
    this.setRoot(fen);
  }

  @action
  jump(action) {
    switch (action) {
      case 'move':
        this.addMove();
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
  addMove() {
    const info = this._chess.history({ verbose: true }).at(-1);
    let move = this.currentMove.children.find((move) => move.uci === info.lan);

    if (!move) {
      move = new Move({
        parent: this.currentMove, //circular ref
        ply: this.currentMove.ply + 1,
        fen: this._chess.fen(),
        san: info.san,
        uci: info.lan,
        outcome: this._chess.isGameOver(),
        children: [],
      });
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

class Move {
  parent;
  ply;
  fen;
  san;
  uci;
  outcome;
  children = [];

  constructor({ parent, ply, fen, san, uci, outcome }) {
    this.parent = parent;
    this.ceval = null;
    this.ply = ply;
    this.fen = fen;
    this.san = san;
    this.uci = uci;
    this.outcome = outcome;
    this.children = [];

    makeAutoObservable(this, {
      parent: false,
      ceval: false,
    });
  }
}
