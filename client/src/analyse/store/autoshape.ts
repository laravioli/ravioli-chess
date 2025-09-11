// https://github.com/lichess-org/lila/blob/master/ui/analyse/src/autoShape.ts
import { parseUci, makeSquare } from 'chessops/util';

function makeShapesFromUci(uci, brush) {
  const move = parseUci(uci);
  const shapes = [{ orig: makeSquare(move.from), dest: makeSquare(move.to), brush }];
  return shapes;
}

export function makeShapes(ctrl) {
  const engine = ctrl.ceval;
  let shapes = [];

  if (engine.enabled && engine.search.multiPv) {
    const node = ctrl.node;
    const bestEval = ctrl.getBestEval(node);
    if (bestEval) shapes = shapes.concat(makeShapesFromUci(bestEval, 'paleBlue'));
    if (node.ceval && node.ceval.pvs[1]) {
      node.ceval.pvs.forEach(pv => {
        if (pv.moves[0] == bestEval) return;
        shapes = shapes.concat(makeShapesFromUci(pv.moves[0], 'paleGrey'));
      });
    }
  }
  return shapes;
}
