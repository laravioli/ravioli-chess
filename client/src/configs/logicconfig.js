/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
export const onDragStart =
  (chess) => (source, piece, position, orientation) => {
    if (chess.isGameOver()) return false;
    if (
      (chess.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (chess.turn() === 'b' && piece.search(/^w/) !== -1)
    ) {
      return false;
    }
  };

export const onDrop = (chess) => (source, target) => {
  try {
    chess.move({
      from: source,
      to: target,
      promotion: 'q',
    });
  } catch (error) {
    return 'snapback';
  }
};
