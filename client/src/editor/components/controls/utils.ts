export function short_fen(fen: FEN) {
  return fen.slice(0, getLastIndex(fen, ' ', 2));
}

function getLastIndex(str: string, substr: string, occ: number) {
  let index = str.length;
  while (occ-- > 0 && index >= 0) {
    index = str.lastIndexOf(substr, index - 1);
  }
  return index;
}
