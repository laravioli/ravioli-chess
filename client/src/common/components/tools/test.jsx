import { usePageStore } from "src/main/hooks/hooks";
import { Action } from "./action";
import { IconTestPipe } from "@tabler/icons-react";

import { parseUci, makeSquare } from "chessops/util";

export const TestButton = () => {
  const store = usePageStore();
  const test = async () => {
    console.log("board " + store.board.getFen());
    console.log("chess " + store.node?.fen);
    console.log("fen from module" + store.fen?.current);
    const move = store.node;
    if (move) {
      console.log("current move", move);
      console.log("bestEval", store.getBestEval?.(move));
      if (move.ceval?.pvs[0]) {
        const m = parseUci(move.ceval.pvs[0].moves[0]);
        console.log(makeSquare(m.from), makeSquare(m.to));
      }
    }
  };
  return (
    <Action label="test" onClick={() => test()}>
      <IconTestPipe size={40} stroke={1.2} />
    </Action>
  );
};
