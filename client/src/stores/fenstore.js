import { DEFAULT_POSITION } from 'chess.js';
import { validateFen } from 'chess.js';

export const createFenSlice = (set, get) => ({
  fen: DEFAULT_POSITION,
  isValidFen: true,
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

  setFen(source = get().boardApi.getBoardFen(), input = false) {
    const fenParser = get()._fenParser(source, input);
    if (fenParser.update) {
      set({ fen: fenParser.result, isValidFen: fenParser.ok });
    }
    return fenParser.update;
  },

  _fenParser(source, input = false) {
    if (!input) {
      const turn = 'w';
      const castlingRights = get()._getCastlingRights();
      const fen = [source, turn, castlingRights, '- 0 1'].join(' ');
      return { result: fen, ok: validateFen(fen).ok, update: true };
    } else {
      const validation = validateFen(source);
      if (
        validation.ok ||
        validation.error === 'Invalid FEN: some pawns are on the edge rows' ||
        validation.error === 'Invalid FEN: missing white king' ||
        validation.error === 'Invalid FEN: missing black king'
      ) {
        get().boardApi.setBoardPosition(source);
        return { result: source, ok: validation.ok, update: true };
      } else {
        return { update: false };
      }
    }
  },

  updateFenControls() {},
});
