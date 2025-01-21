import { DEFAULT_POSITION, validateFen } from 'chess.js';

export const createFenSlice = (set, get) => ({
  fen: DEFAULT_POSITION,
  fenInputRef: undefined,
  isLegalFen: true,
  turn: 'w',
  castling: {
    K: true,
    Q: true,
    k: true,
    q: true,
  },

  setTurn(turn = undefined) {
    set((state) => {
      const newTurn = turn ?? state.turn === 'w' ? 'b' : 'w';
      return { turn: newTurn };
    });
    get().updateFen();
  },

  setCastlingRights(id, value) {
    if (Array.isArray(id)) {
      id.forEach((i) =>
        set((state) => ({ castling: { ...state.castling, [i]: value } }))
      );
    } else {
      set((state) => ({ castling: { ...state.castling, [id]: value } }));
    }
    get().updateFen();
  },

  _getCastlingRights() {
    const cr = Object.entries(get().castling)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join('');
    return cr === '' ? '-' : cr;
  },

  updateFen(source = get().boardApi.getBoardFen(), input = false) {
    const fenParser = get()._fenParser(source, input);
    if (fenParser.update) {
      set({ fen: fenParser.result, isLegalFen: fenParser.ok });
    }
    return fenParser.update;
  },

  _fenParser(source, input = false) {
    if (!input) {
      const turn = get().turn;
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

  validateFen() {
    const input = get().fenInputRef.current.value;
    if (input !== get().fen) {
      const isValidFen = get().updateFen(input, true);
      if (isValidFen) {
        get()._inputUpdateUi(input);
      } else {
        get().fenInputRef.current.value = get().fen;
      }
    }
    return get().isLegalFen;
  },

  _inputUpdateUi(source) {
    get().boardApi.setBoardPosition(source);
    set({ turn: source.split(' ')[1] });
    set({
      castling: Object.keys(get().castling).reduce((acc, key) => {
        acc[key] = source.split(' ')[2].includes(key);
        return acc;
      }, {}),
    });
  },

  fenResetUi(cr) {
    const castlingRights = ['K', 'Q', 'k', 'q'];
    get().setCastlingRights(castlingRights, cr);
    set({ turn: 'w' });
  },
});
