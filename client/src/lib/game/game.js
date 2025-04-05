import { Chess } from 'chess.js';
import { computed } from 'src/main/store/reactive';
import { makeObservable } from 'src/main/store';
import { observable } from '../../main/store/reactive';
import { upperize } from './utils';

//todo : finish moving fen update to game (turn ovverride prb)

export class Game {
  constructor(fen) {
    makeObservable(
      this,
      { outcome: computed, namespace: 'game' },
      {
        fenPosition: observable,
        turn: observable,
        castling: observable,
        halfmove: observable,
        fullmove: observable,
      }
    );
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

  jump = (action) => {
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
  };

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

  undo() {
    if (this.currentMove.parent) {
      this.currentMove = this.currentMove.parent;
      this._chess.undo();
    }
  }

  redo() {
    if (this.currentMove.children.length > 0) {
      this.currentMove = this.currentMove.children[0];
      this._chess.move(this.currentMove.san);
    }
  }

  start() {
    this.currentMove = this.root;
    this._chess.load(this.currentMove.fen);
  }

  end() {
    if (this.currentMove !== this.root) {
      this.currentMove = this.root;
      this._chess.load(this.root.fen);
    }
    while (this.currentMove.children.length > 0) {
      this.currentMove = this.currentMove.children[0];
      this._chess.move(this.currentMove.san);
    }
  }

  updateFen() {
    const sfen = this._chess.fen().split(' ');
    const castling = {
      ...upperize(this._chess.getCastlingRights('w')),
      ...this._chess.getCastlingRights('b'),
    };

    this.fenPosition = sfen[0];
    this.turn = this._chess.turn();
    this.castling = castling;
    this.halfmove = sfen[4];
    this.fullmove = this._chess.moveNumber();
  }
}
