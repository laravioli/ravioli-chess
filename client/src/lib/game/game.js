import { Chess } from 'chess.js';
import { mainStore } from 'src/main/store';
import { linkStateToStore, computed } from 'src/main/store/reactive';

const makeObservable = linkStateToStore(mainStore, 'game');

export class Game {
  constructor(fen) {
    makeObservable(this, { outcome: computed });
    this._chess = new Chess(fen);
    this.initHistory(fen);
    this.outcome = () => this._chess.isGameOver();

    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) {
          return target[prop];
        }
        if (prop in target._chess) {
          const chessProp = target._chess[prop];
          if (typeof chessProp === 'function') {
            return (...args) => chessProp.apply(target._chess, args);
          }
          return chessProp;
        }
        return undefined;
      },
    });
  }

  initHistory(fen) {
    const ply = this._chess.turn() == 'w' ? 0 : 1;
    this.currentMove = this.root = {
      parent: null,
      ply,
      fen,
      children: [],
    };
  }

  load(fen) {
    this._chess.load(fen);
    this.initHistory(fen);
  }

  move(source, target) {
    this._chess.move({
      from: source,
      to: target,
      promotion: 'q',
    });
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
    const info = this._chess.history({ verbose: true }).at(-1);
    let move = this.currentMove.children.find((move) => move.uci === info.lan);

    if (!move) {
      move = {
        parent: this.currentMove, //circular ref
        ply: this.currentMove.ply + 1,
        fen: this._chess.fen(),
        san: info.san,
        uci: info.lan,
        children: [],
      };
      this.currentMove.children.push(move);
    }
    this.currentMove = move;
  }

  undoMove() {
    if (this.currentMove.parent) {
      this.currentMove = this.currentMove.parent;
      this._chess.undo();
    }
  }

  redoMove() {
    if (this.currentMove.children.length > 0) {
      this.currentMove = this.currentMove.children[0];
      this._chess.move(this.currentMove.san);
    }
  }

  goStart() {
    this.currentMove = this.root;
    this._chess.load(this.currentMove.fen);
  }

  goEnd() {
    if (this.currentMove !== this.root) {
      this.currentMove = this.root;
      this._chess.load(this.root.fen);
    }
    while (this.currentMove.children.length > 0) {
      this.currentMove = this.currentMove.children[0];
      this._chess.move(this.currentMove.san);
    }
  }
}
