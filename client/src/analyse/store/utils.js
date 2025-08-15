import { Chess } from "chessops/chess";
import { makeFen, parseFen } from "chessops/fen";
import { makeSanAndPlay } from "chessops/san";
import { chessgroundDests } from "chessops/compat";
import { roleToChar, parseUci } from "chessops/util";

// prettier-ignore
const SQUARES = [
  'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
  'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
  'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
  'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
  'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
  'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
  'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
  'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
]

const IDS = new Map(generateIds());

function* generateIds() {
  yield* Array.from({ length: 64 }, (_, i) => [
    SQUARES[i],
    String.fromCharCode(35 + i),
  ]);
}

function uciToId(uci) {
  const start = uci.slice(0, 2);
  const end = uci.slice(2, 4);
  return `${IDS.get(start)}${IDS.get(end)}`;
}

function cgToUci(orig, dest, capture = undefined) {
  let uci = `${orig}${dest}`;
  if (capture) uci = uci.concat(roleToChar(capture.role));
  return uci;
}

const setNodeChecks = (node, pos) => {
  pos.isCheck() &&
    (node["check"] = true) &&
    pos.isCheckmate() &&
    (node["outcome"] = true);
};

export function setRoot(fen) {
  const setup = parseFen(fen).unwrap();
  const pos = Chess.fromSetup(setup).unwrap();
  const ply = (setup.turn === "white" ? 0 : 1) + 2 * (setup.fullmoves - 1);
  const dests = chessgroundDests(pos);
  const root = { children: [], fen, id: "", ply, dests };
  setNodeChecks(root, pos);

  return root;
}

export function nodeFromUser(parent, origin, dest, capture = undefined) {
  const setup = parseFen(parent.fen).unwrap();
  const pos = Chess.fromSetup(setup).unwrap();
  const uci = cgToUci(origin, dest, capture);
  const san = makeSanAndPlay(pos, parseUci(uci));
  const newFen = makeFen(pos.toSetup());
  const dests = chessgroundDests(pos);
  const newNode = {
    children: [],
    fen: newFen,
    id: uciToId(uci),
    ply: parent.ply + 1,
    san,
    uci,
    dests,
  };
  setNodeChecks(newNode, pos);

  return newNode;
}
