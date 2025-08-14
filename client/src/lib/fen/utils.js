import { parseFen, makeFen } from "chessops/fen";
import { setupPosition } from "chessops/variant";

const CASTLINGS = ["K", "Q", "k", "q"];

export const castlingsToFen = (castling) => {
  const cr = Object.entries(castling)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join("");
  return cr === "" ? "-" : cr;
};

export function fenToCastlings(fenCastling) {
  return CASTLINGS.reduce((acc, key) => {
    acc[key] = fenCastling.includes(key);
    return acc;
  }, {});
}

export function getLegalFen(fen) {
  const setup = parseFen(fen);
  return setup.isOk
    ? setupPosition("chess", setup.unwrap()).unwrap(
        (pos) => makeFen(pos.toSetup()),
        (_) => undefined
      )
    : undefined;
}

export function validateFen(fen) {
  const setup = parseFen(fen);
  return (
    setup.isOk &&
    setup.unwrap().turn &&
    makeFen(setup.unwrap()).replace(/[AaHh]/g, "")
  );
}

import { Castles } from "chessops/variant";

export class Test {
  pockets = undefined;
  turn = undefined;
  castlingRights = undefined;
  epSquare = undefined;
  remainingChecks = undefined;
  halfmoves = undefined;
  fullmoves = undefined;
  castlingToggles = {};

  setSetup = (setup) => {
    this.pockets = setup.pockets;
    this.turn = setup.turn;
    this.castlingRights = setup.castlingRights;
    this.epSquare = setup.epSquare;
    this.remainingChecks = setup.remainingChecks;
    this.halfmoves = setup.halfmoves;
    this.fullmoves = setup.fullmoves;

    const castles = Castles.fromSetup(setup);
    this.castlingToggles["Q"] =
      castles.rook.white.a !== undefined || this.castlingRights.has(0);
    this.castlingToggles["K"] =
      castles.rook.white.h !== undefined || this.castlingRights.has(7);
    this.castlingToggles["q"] =
      castles.rook.black.a !== undefined || this.castlingRights.has(56);
    this.castlingToggles["k"] =
      castles.rook.black.h !== undefined || this.castlingRights.has(63);
  };

  setFen = (fen) =>
    parseFen(fen).unwrap(
      (setup) => {
        if (this.chessground) this.chessground.set({ fen });
        this.setSetup(setup);
        return true;
      },
      (_) => false
    );
}

window.test = Test;
