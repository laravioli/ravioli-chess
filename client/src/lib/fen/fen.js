import { DEFAULT_POSITION } from 'chess.js';
import { observable, computed, action } from 'mobx';
import { getCastlingRights, isValidInput } from '../../common/stores/utils';
import { validateFen } from 'chess.js';

export class Fen {
  @observable accessor position;
  @observable accessor turn;
  @observable accessor castling;
  @observable accessor halfmove;
  @observable accessor fullmove;
  inputRef = { current: null };

  constructor(rootStore, fen) {
    this.rootStore = rootStore;
    this.set((fen = DEFAULT_POSITION));
  }

  @computed
  get current() {
    return [
      this.position,
      this.turn,
      getCastlingRights(this.castling),
      '-',
      this.halfmove,
      this.fullmove,
    ].join(' ');
  }

  @computed
  get isLegal() {
    return validateFen(this.current).ok;
  }

  @action
  set(initialFen) {
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
    this.castling[id] = value;
  }

  @action
  setTurn(turn = undefined) {
    const newTurn = turn ?? (this.turn === 'w' ? 'b' : 'w');
    this.turn = newTurn;
  }

  @action
  setFromInput(input) {
    if (input !== this.current && isValidInput(input)) {
      this.set(input);
    } else {
      this.inputRef.current.value = this.current;
    }
  }

  @action
  isAnalysable() {
    this.setFromInput(this.inputRef.current.value);
    return this.isLegal;
  }

  @action
  reset(cr) {
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
