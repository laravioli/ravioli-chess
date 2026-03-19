import { observable, computed, action } from 'mobx';
import { Board } from 'chessops/board';
import { setupPosition, Castles } from 'chessops/variant';
import { makeFen, parseFen, parseCastlingFen } from 'chessops/fen';
import { type Setup, Material, RemainingChecks } from 'chessops/setup';
import type { SquareSet } from 'chessops/squareSet';

import { defined } from '@/lib/common';

import { castlingsToFen } from './utils';
import type { Castlings, CastlingSide } from './interface';

export class Fen {
  remainingChecks: RemainingChecks | undefined;
  pockets: Material | undefined;
  initialFen: string;

  @observable accessor boardFen: string;
  @observable accessor turn: Color;
  @observable accessor castlings: Castlings;
  @observable accessor castlingRights: SquareSet | undefined;
  @observable accessor halfmoves: number;
  @observable accessor fullmoves: number;

  constructor(fen: FEN) {
    this.initialFen = fen.split(' ')[0];
    this.castlings = { K: false, Q: false, k: false, q: false };
    this.set(fen);
  }

  @computed
  get current() {
    return this.legalFen || makeFen(this.getSetup());
  }

  @computed
  get legalFen() {
    return setupPosition('chess', this.getSetup()).unwrap(
      (pos) => makeFen(pos.toSetup()),
      (_) => undefined,
    );
  }

  getSetup(): Setup {
    const fen = this.boardFen || this.initialFen;
    const board = parseFen(fen).unwrap(
      (setup) => setup.board,
      (_) => Board.empty(),
    );

    return {
      board,
      pockets: this.pockets,
      turn: this.turn,
      castlingRights:
        this.castlingRights || parseCastlingFen(board, castlingsToFen(this.castlings)).unwrap(),
      epSquare: undefined,
      remainingChecks: this.remainingChecks,
      halfmoves: this.halfmoves,
      fullmoves: this.fullmoves,
    };
  }

  @action
  set(fen: FEN, updateBoard?: () => void) {
    parseFen(fen).unwrap(
      (setup) => {
        updateBoard?.();
        this.setSetup(setup);
        return true;
      },
      (_) => false,
    );
  }

  @action
  setSetup(setup: Setup) {
    this.pockets = setup.pockets;
    this.turn = setup.turn;
    this.castlingRights = setup.castlingRights;
    this.remainingChecks = setup.remainingChecks;
    this.halfmoves = setup.halfmoves;
    this.fullmoves = setup.fullmoves;

    const castles = Castles.fromSetup(setup);
    this.castlings['Q'] = defined(castles.rook.white.a) || this.castlingRights.has(0);
    this.castlings['K'] = defined(castles.rook.white.h) || this.castlingRights.has(7);
    this.castlings['q'] = defined(castles.rook.black.a) || this.castlingRights.has(56);
    this.castlings['k'] = defined(castles.rook.black.h) || this.castlingRights.has(63);
  }

  @action
  setCastlingRight(id: CastlingSide, value: boolean) {
    if (this.castlings[id] !== value) this.castlingRights = undefined;
    this.castlings[id] = value;
  }

  @action
  setTurn(color: Color) {
    this.turn = color;
  }

  isValid(fen: FEN) {
    return parseFen(fen).isOk;
  }
}
