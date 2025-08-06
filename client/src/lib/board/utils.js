import imgUrl from "/images/pieces/bases/bB.png";
import { SQUARES } from "chess.js";

export const pieceTheme = function (theme) {
  const base = imgUrl.split("base")[0] + `${theme}/`;
  return function (piece) {
    return base + piece + ".png";
  };
};
