const CASTLINGS = ["K", "Q", "k", "q"];

export const castlingsToFen = (castling) => {
  let fen = "";
  for (const toggle of CASTLINGS) {
    if (castling[toggle]) fen += toggle;
  }
  return fen;
};
