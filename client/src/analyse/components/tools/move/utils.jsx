import React from "react";
import classes from "./move.module.css";

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
