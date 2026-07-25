import { parseUci } from 'chessops';
import { Chess } from 'chessops/chess';
import { chessgroundDests } from 'chessops/compat';
import { makeFen, parseFen } from 'chessops/fen';
import { makeSanAndPlay } from 'chessops/san';
import { makeObservable, observable } from 'mobx';

import type { Node } from '@/lib/tree/interface';

import { cgToUci, uciToId } from './utils';

export function makeObservableNode(node: Node): Node {
  return makeObservable(node, {
    ceval: observable.ref,
  });
}

export function makeRoot(fen: FEN): Node {
  const setup = parseFen(fen).unwrap();
  const pos = Chess.fromSetup(setup).unwrap();
  const ply = (setup.turn === 'white' ? 0 : 1) + 2 * (setup.fullmoves - 1);
  const dests = chessgroundDests(pos);
  const isCheck = pos.isCheck();
  return {
    children: [],
    fen,
    id: '',
    ply,
    dests,
    ceval: undefined,
    check: isCheck,
    outcome: isCheck && pos.isCheckmate(),
  };
}

export function makeNode(parent: Node, origin: Key, dest: Key): Node {
  const setup = parseFen(parent.fen).unwrap();
  const pos = Chess.fromSetup(setup).unwrap();
  const uci = cgToUci(origin, dest);
  const san = makeSanAndPlay(pos, parseUci(uci)!);
  const newFen = makeFen(pos.toSetup());
  const dests = chessgroundDests(pos);
  const isCheck = pos.isCheck();
  return {
    children: [],
    fen: newFen,
    id: uciToId(uci),
    ply: parent.ply + 1,
    san,
    uci,
    dests,
    ceval: undefined,
    check: isCheck,
    outcome: isCheck && pos.isCheckmate(),
  };
}
