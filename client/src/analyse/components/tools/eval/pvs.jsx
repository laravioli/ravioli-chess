import React from "react";
import { observer } from "mobx-react-lite";
import { useLocalStorage, usePageStore } from "src/main/hooks/hooks";
import { setupPosition } from "chessops/variant";
import { lichessRules } from "chessops/compat";
import { makeSanAndPlay } from "chessops/san";
import { parseUci } from "chessops/util";
import { parseFen } from "chessops/fen";
import { getEval } from "src/lib/eval/utils";
import { Text, Divider } from "@mantine/core";
import classes from "./eval.module.css";

const MAX_NUM_MOVES = 12;

function parsePv(pos, pv) {
  const nb = Math.min(MAX_NUM_MOVES, pv.length);
  const result = [];
  for (let i = 0; i < nb; i++) {
    if (pos.turn === "white") result.push(`${pos.fullmoves}.`);
    else if (i === 0) result.push(`${pos.fullmoves}...`);
    const uci = pv[i];
    const san = makeSanAndPlay(pos, parseUci(uci));
    if (san === "--") break;
    result.push(san);
  }
  return result.join(" ");
}

export const Pvs = observer(() => {
  const analyseStore = usePageStore();
  const multipv = useLocalStorage().evalStorage.multipv;
  return (
    <>
      {analyseStore.ceval.enabled &&
        !analyseStore.node.outcome &&
        renderPvs(analyseStore.node.ceval, multipv)}
    </>
  );
});

function renderPvs(evaluation, multipv) {
  let pvs;
  if (!evaluation) pvs = new Array(multipv).fill({});
  else {
    const setup = parseFen(evaluation.fen).unwrap();
    const pos = setupPosition(lichessRules("standard"), setup);
    pvs = Array.from({ length: multipv }, (_, i) => {
      const pvData = evaluation.pvs?.[i];
      if (!pvData || !pos) return "";
      return {
        moves: parsePv(pos.isOk ? pos.value.clone() : undefined, pvData.moves),
        eval: pvData,
      };
    });
  }
  return (
    <>
      {pvs.map((pv, index) => (
        <React.Fragment key={index}>
          <Text classNames={{ root: classes.pvs }} lineClamp={1}>
            {multipv > 1 && (
              <span style={{ opacity: 0.6, marginRight: 6 }}>
                {getEval(pv.eval)}
              </span>
            )}
            {pv.moves}
          </Text>
          <Divider />
        </React.Fragment>
      ))}
    </>
  );
}
