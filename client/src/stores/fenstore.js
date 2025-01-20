import { DEFAULT_POSITION } from 'chess.js';
import { validateFen } from 'chess.js';

export const createFenSlice = (set, get) => ({
  fen: DEFAULT_POSITION,
  isValidFen: true,
  turn: 'w',
  castling: {
    K: true,
    Q: true,
    k: true,
    q: true,
  },

  setCastlingRight(id, value) {
    set((state) => ({ castling: { ...state.castling, [id]: value } }));
    get().setFen();
  },

  _getCastlingRights() {
    const cr = Object.entries(get().castling)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join('');
    return cr === '' ? '-' : cr;
  },

  setFen(source = get().boardApi.getBoardFen(), input = false) {
    const fenParser = get()._fenParser(source, input);
    if (fenParser.update) {
      set({ fen: fenParser.result, isValidFen: fenParser.ok });
      if (input == true) {
        get()._fenUpdateUi(source);
      }
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
        return { result: source, ok: validation.ok, update: true };
      } else {
        return { update: false };
      }
    }
  },

  _fenUpdateUi(source) {
    get().boardApi.setBoardPosition(source);
    set({
      castling: Object.keys(get().castling).reduce((acc, key) => {
        acc[key] = source.split(' ')[2].includes(key);
        return acc;
      }, {}),
    });
  },
});
