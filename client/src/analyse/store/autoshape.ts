// https://github.com/lichess-org/lila/blob/master/ui/analyse/src/autoShape.ts
import type { DrawShape } from '@lichess-org/chessground/draw';
import { isDrop } from 'chessops/types';
import { makeSquare, parseUci } from 'chessops/util';

import type { AnalyseStore } from './analyse';

function makeShapesFromUci(uci: string, brush: string) {
  const move = parseUci(uci)!;
  const to = makeSquare(move.to);
  if (isDrop(move)) return [];

  const shapes: DrawShape[] = [{ orig: makeSquare(move.from), dest: to, brush }];
  return shapes;
}

export function makeShapes(ctrl: AnalyseStore) {
  const engine = ctrl.ceval;
  let shapes: DrawShape[] = [];

  if (ctrl.ceval.isActive && engine.search.multiPv) {
    const node = ctrl.node;
    const bestEval = ctrl.getBestEval(node);
    if (bestEval) shapes = shapes.concat(makeShapesFromUci(bestEval, 'paleBlue'));
    if (node.ceval && node.ceval.pvs[1]) {
      node.ceval.pvs.forEach((pv) => {
        if (pv.moves[0] == bestEval) return;
        shapes = shapes.concat(makeShapesFromUci(pv.moves[0], 'paleGrey'));
      });
    }
  }
  return shapes;
}
