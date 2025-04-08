import { observable, computed } from 'src/main/store/reactive';
import { makeObservable } from 'src/main/store';
import { validateFen } from 'chess.js';

export class Fen {
  constructor() {
    makeObservable(this, {
      fen: computed,
      isLegalFen: computed,
      fenPosition: observable,
      turn: observable,
      castling: observable,
      halfmove: observable,
      fullmove: observable,
      fenInputRef: observable,
    });
    this.fenPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    this.turn = 'w';
    this.castling = {
      K: true,
      Q: true,
      k: true,
      q: true,
    };
    this.halfmove = 0;
    this.fullmove = 1;
    this.fenInputRef = undefined;
  }

  _getCastlingRights() {
    const cr = Object.entries(this.castling)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join('');
    return cr === '' ? '-' : cr;
  }

  setCastlingRight(id, value) {
    this.castling = { ...this.castling, [id]: value };
  }

  fen() {
    const fen = [
      this.fenPosition,
      this.turn,
      this._getCastlingRights(),
      '-',
      this.halfmove,
      this.fullmove,
    ].join(' ');
    return fen;
  }

  isLegalFen = () => validateFen(this.fen()).ok;

  setTurn(turn = undefined) {
    const newTurn = turn ?? (this.turn === 'w' ? 'b' : 'w');
    this.turn = newTurn;
  }

  setFen(input) {
    if (input !== this.fen() && this._isValidInput(input)) {
      const newState = input.split(' ');
      this.fenPosition = newState[0];
      this.turn = newState[1];
      this.castling = Object.keys(this.castling).reduce((acc, key) => {
        acc[key] = newState[2].includes(key);
        return acc;
      }, {});
      this.halfmove = newState[4];
      this.fullmove = newState[5];
    } else {
      this.fenInputRef.current.value = this.fen();
    }
  }

  _isValidInput(input) {
    const validation = validateFen(input);
    const validErrors = [
      'Invalid FEN: some pawns are on the edge rows',
      'Invalid FEN: missing white king',
      'Invalid FEN: missing black king',
    ];
    if (validation.ok || validErrors.includes(validation.error)) {
      return true;
    } else {
      return false;
    }
  }

  isFenAnalysable() {
    this.setFen(this.fenInputRef.current.value);
    return this.isLegalFen();
  }

  resetFen(cr) {
    this.fenPosition = cr
      ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
      : '8/8/8/8/8/8/8/8';
    this.turn = 'w';
    this.castling = {
      K: cr,
      Q: cr,
      k: cr,
      q: cr,
    };
    this.halfmove = 0;
    this.fullmove = 1;
  }
}
