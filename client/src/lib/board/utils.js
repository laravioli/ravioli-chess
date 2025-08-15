import imgUrl from "/images/pieces/bases/bB.png";

export const pieceTheme = function (theme) {
  const base = imgUrl.split("base")[0] + `${theme}/`;
  return function (piece) {
    return base + piece + ".png";
  };
};
