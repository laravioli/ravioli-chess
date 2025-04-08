import { observable, computed } from 'src/main/store/reactive';
import { makeObservable } from 'src/main/store';
import { validateFen } from 'chess.js';

export class Fen {
  constructor(fen) {
    makeObservable(this, {
      current: computed,
      position: observable,
      turn: observable,
      castling: observable,
      halfmove: observable,
      fullmove: observable,
      inputRef: observable,
      isLegal: computed,
      namespace: 'fen',
    });
    this.inputRef = undefined;
    this.current = () => {
      const fen = [
        this.position,
        this.turn,
        this._getCastlingRights(),
        '-',
        this.halfmove,
        this.fullmove,
      ].join(' ');
      return fen;
    };
    this.isLegal = () => validateFen(this.current()).ok;
    this.setFen(fen);

    console.log(this);
  }

  setFen(initialFen) {
    const fen = initialFen.split(' ');
    this.position = fen[0];
    this.turn = fen[1];
    this.castling = ['K', 'Q', 'k', 'q'].reduce((acc, key) => {
      acc[key] = fen[2].includes(key);
      return acc;
    }, {});
    this.halfmove = fen[4];
    this.fullmove = fen[5];
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

  setTurn(turn = undefined) {
    const newTurn = turn ?? (this.turn === 'w' ? 'b' : 'w');
    this.turn = newTurn;
  }

  setFenFromInput(input) {
    if (input !== this.current() && this._isValidInput(input)) {
      this.setFen(input);
    } else {
      this.inputRef.current.value = this.current();
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
    this.setFenFromInput(this.inputRef.current.value);
    return this.isLegal();
  }

  resetFen(cr) {
    this.position = cr
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
