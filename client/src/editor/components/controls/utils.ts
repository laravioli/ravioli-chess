export function short_fen(fen) {
  return fen.slice(0, getLastIndex(fen, ' ', 2));
}

function getLastIndex(str, substr, occ) {
  let index = str.length;
  while (occ-- > 0 && index >= 0) {
    index = str.lastIndexOf(substr, index - 1);
  }
  return index;
}
