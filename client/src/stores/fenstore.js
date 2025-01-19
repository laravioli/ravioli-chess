import { DEFAULT_POSITION } from 'chess.js';

export const createFenSlice = (set, get) => ({
  fen: DEFAULT_POSITION,

  castling: {
    K: true,
    Q: true,
    k: true,
    q: true,
  },

  setCastlingRight(id, value) {
    set((state) => ({ castling: { ...state.castling, [id]: value } }));
  },

  _getCastlingRights() {
    return Object.entries(get().castling)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join('');
  },

  getFen: () => get().fen,

  setFen: (boardFen = get().boardApi.getBoardFen()) => {
    const turn = 'w';
    const castlingRights = get()._getCastlingRights();
    const fen = [boardFen, turn, castlingRights, '- 0 1'].join(' ');
    console.log(fen);
    set({ fen: fen });
  },
});
