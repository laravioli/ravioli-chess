import imgUrl from '/images/pieces/bases/bB.png';

export const objectMap = (obj, fn) =>
  Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));

export const pieceTheme = function (theme) {
  const base = imgUrl.split('base')[0] + `${theme}/`;
  return function (piece) {
    return base + piece + '.png';
  };
};
