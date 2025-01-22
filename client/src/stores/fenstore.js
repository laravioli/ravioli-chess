import { DEFAULT_POSITION, validateFen as vf } from 'chess.js';

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
  halfmove: 0,
  fullmove: 1,

  setTurn(turn = undefined) {
    set((state) => {
      const newTurn = turn ?? (state.turn === 'w' ? 'b' : 'w');
      return { turn: newTurn };
    });
    get().updateFen();
  },

  setCastlingRight(id, value) {
    set((state) => ({ castling: { ...state.castling, [id]: value } }));
    get().updateFen();
  },

  updateFen({ source = null, input = false } = {}) {
    const fenParser = get()._fenParser({ source, input });
    if (fenParser.valid) {
      set({ fen: fenParser.fen, isLegalFen: fenParser.legal });
    }
    return fenParser.valid;
  },

  _fenParser({ source, input }) {
    const state = get();
    if (!input) {
      const fen = [
        source ?? state.boardApi.getBoardFen(),
        state.turn,
        state._getCastlingRights(),
        '-',
        state.halfmove,
        state.fullmove,
      ].join(' ');
      return { fen: fen, legal: vf(fen).ok, valid: true };
    } else {
      const input = state.fenInputRef.current.value;
      const validation = vf(input);
      const validErrors = [
        'Invalid FEN: some pawns are on the edge rows',
        'Invalid FEN: missing white king',
        'Invalid FEN: missing black king',
      ];
      if (validation.ok || validErrors.includes(validation.error)) {
        return { fen: input, legal: validation.ok, valid: true };
      } else {
        return { fen: state.fen, legal: validation.ok, valid: false };
      }
    }
  },

  _getCastlingRights() {
    const cr = Object.entries(get().castling)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join('');
    return cr === '' ? '-' : cr;
  },

  validateFen() {
    const state = get();
    const input = state.fenInputRef.current.value;
    if (input !== state.fen) {
      const isValidFen = state.updateFen({ input: true });
      if (isValidFen) {
        state._inputUpdateUi(input);
      } else {
        state.fenInputRef.current.value = state.fen;
      }
    }
    return get().isLegalFen;
  },

  _inputUpdateUi(source) {
    set({
      turn: source.split(' ')[1],
      castling: Object.keys(get().castling).reduce((acc, key) => {
        acc[key] = source.split(' ')[2].includes(key);
        return acc;
      }, {}),
      halfmove: source.split(' ')[4],
      fullmove: source.split(' ')[5],
    });
    get().boardApi.setBoardPosition(source);
  },

  resetFen(cr) {
    set({
      turn: 'w',
      castling: {
        K: cr,
        Q: cr,
        k: cr,
        q: cr,
      },
      halfmove: 0,
      fullmove: 1,
    });
    get().updateFen();
  },
});
