import { DEFAULT_POSITION } from 'chess.js';
import { observable, computed, action } from 'mobx';
import { getCastlingRights, isValidInput, validateFen } from './utils';

export class FenStore {
  @observable accessor position;
  @observable accessor turn;
  @observable accessor castling;
  @observable accessor halfmove;
  @observable accessor fullmove;
  inputRef = { current: null };

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.setFen(DEFAULT_POSITION);
  }

  @computed
  get current() {
    const fen = [
      this.position,
      this.turn,
      getCastlingRights(this.castling),
      '-',
      this.halfmove,
      this.fullmove,
    ].join(' ');
    return fen;
  }

  @computed
  get isLegal() {
    return validateFen(this.current).ok;
  }

  @action
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

  @action
  setCastlingRight(id, value) {
    this.castling = { ...this.castling, [id]: value };
  }

  @action
  setTurn(turn = undefined) {
    const newTurn = turn ?? (this.turn === 'w' ? 'b' : 'w');
    this.turn = newTurn;
  }

  @action
  setFenFromInput(input) {
    if (input !== this.current && isValidInput(input)) {
      this.setFen(input);
    } else {
      this.inputRef.current.value = this.current;
    }
  }

  @action
  isFenAnalysable() {
    this.setFenFromInput(this.inputRef.current.value);
    return this.isLegal;
  }

  @action
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
