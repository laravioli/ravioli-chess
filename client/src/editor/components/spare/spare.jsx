import { observer } from "mobx-react-lite";
import { usePageStore } from "src/main/hooks/hooks";
import classes from "./spare.module.css";
import clsx from "clsx";
import React from "react";

export const SparePieces = observer(({ side }) => {
  const editor = usePageStore();
  const orientation = editor.ui.orientation;
  const color = side === "bottom" ? orientation : opposite(orientation);
  const pieces = ["pawn", "knight", "bishop", "rook", "queen", "king"];
  return (
    <div className={getClasses(side, color)}>
      {pieces.map((p) => (
        <React.Fragment key={p}>
          <div className={classes.spare} onMouseDown={(e) => {}}>
            <div>
              <div className={clsx(classes.piece, classes[`${p}`])}></div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
});

const opposite = (color) => (color === "white" ? "black" : "white");
const getClasses = (side, color) =>
  clsx(classes[`spare-${side}`], classes[`spare-${color}`]);
