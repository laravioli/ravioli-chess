import { observable, computed, action } from "mobx";
import { defined } from "src/lib/common";
import { castlingsToFen } from "./utils";
import { Board } from "chessops/board";
import { setupPosition, Castles } from "chessops/variant";
import { makeFen, parseFen, parseCastlingFen } from "chessops/fen";

export class Fen {
  remainingChecks = undefined;
  pockets = undefined;
  @observable accessor boardFen;
  @observable accessor turn;
  @observable accessor castlings;
  @observable accessor castlingRights;
  @observable accessor halfmoves;
  @observable accessor fullmoves;

  constructor(fen) {
    this.initialFen = fen.split(" ")[0];
    this.castlings = { K: false, Q: false, k: false, q: false };
    this.set(fen);
  }

  @computed
  get current() {
    return this.legalFen || makeFen(this.getSetup());
  }

  @computed
  get legalFen() {
    return setupPosition("chess", this.getSetup()).unwrap(
      (pos) => makeFen(pos.toSetup()),
      (_) => undefined
    );
  }

  getSetup() {
    const fen = this.boardFen || this.initialFen;
    const board = parseFen(fen).unwrap(
      (setup) => setup.board,
      (_) => Board.empty()
    );

    return {
      board,
      pockets: this.pockets,
      turn: this.turn,
      castlingRights:
        this.castlingRights ||
        parseCastlingFen(board, castlingsToFen(this.castlings)).unwrap(),
      epSquare: undefined,
      remainingChecks: this.remainingChecks,
      halfmoves: this.halfmoves,
      fullmoves: this.fullmoves,
    };
  }

  @action
  set(fen, updateBoard) {
    parseFen(fen).unwrap(
      (setup) => {
        updateBoard?.();
        this.setSetup(setup);
        return true;
      },
      (_) => false
    );
  }

  @action
  setSetup(setup) {
    this.pockets = setup.pockets;
    this.turn = setup.turn;
    this.castlingRights = setup.castlingRights;
    this.remainingChecks = setup.remainingChecks;
    this.halfmoves = setup.halfmoves;
    this.fullmoves = setup.fullmoves;

    const castles = Castles.fromSetup(setup);
    this.castlings["Q"] =
      defined(castles.rook.white.a) || this.castlingRights.has(0);
    this.castlings["K"] =
      defined(castles.rook.white.h) || this.castlingRights.has(7);
    this.castlings["q"] =
      defined(castles.rook.black.a) || this.castlingRights.has(56);
    this.castlings["k"] =
      defined(castles.rook.black.h) || this.castlingRights.has(63);
  }

  @action
  setCastlingRight(id, value) {
    if (this.castlings[id] !== value) this.castlingRights = undefined;
    this.castlings[id] = value;
  }

  @action
  setTurn(color) {
    this.turn = color;
  }

  isValid(fen) {
    return parseFen(fen).isOk;
  }
}
