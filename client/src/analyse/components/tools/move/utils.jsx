import React from "react";
import { setupPosition } from "chessops/variant";
import { lichessRules } from "chessops/compat";
import { makeSanAndPlay } from "chessops/san";
import { parseUci } from "chessops/util";
import { parseFen } from "chessops/fen";
import { renderEval } from "src/lib/eval/utils";
import { Text, Divider } from "@mantine/core";
import classes from "./move.module.css";

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

export function renderPvs(evaluation, multipv) {
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

export const renderLine = (line, handlers) => {
  let turn, move, path;
  line = line.slice(1);
  if (line.length == 0) return null;

  return (
    <div className={classes.lines} onClick={handlers["click"]}>
      {line
        .map((node, index) => {
          turn = plyToTurn(node.ply);
          if (index == 0 && color(node.ply) === "black") {
            path += node.id;
            move = ["...", node.san];
            path = [null, node.id];
          } else if (color(node.ply) === "white") {
            move = [node.san, line[index + 1]?.san ?? null];
            path = path
              ? [path[1] + node.id, path[1] + node.id + line[index + 1]?.id]
              : [node.id, node.id + line[index + 1]?.id];
          } else {
            return null;
          }
          return (
            <React.Fragment key={turn}>
              <span className={classes.row}>{turn}</span>
              <div className={classes.move} data-p={path[0]}>
                {move[0]}
              </div>
              {move[1] && (
                <div className={classes.move} data-p={path[1]}>
                  {move[1]}
                </div>
              )}
            </React.Fragment>
          );
        })
        .filter((value) => value)}
    </div>
  );
};

const color = (ply) => ((ply - 1) % 2 === 0 ? "white" : "black");

const plyToTurn = (ply) => Math.floor((ply - 1) / 2) + 1;

export const getEval = (evaluation) => {
  if (evaluation) {
    if (evaluation.mate) {
      return "#" + evaluation.mate;
    } else {
      return renderEval(evaluation.cp);
    }
  }
};
