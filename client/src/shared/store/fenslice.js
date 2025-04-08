//import { validateFen } from 'chess.js';

export const createFenSlice = (/*set, get*/) => ({
  /*
  fenPosition: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  turn: 'w',
  castling: {
    K: true,
    Q: true,
    k: true,
    q: true,
  },
  halfmove: 0,
  fullmove: 1,
  fenInputRef: undefined,
  isLegalFen: () => validateFen(get().fen()).ok,

  fen() {
    const state = get();
    const fen = [
      state.fenPosition,
      state.turn,
      state._getCastlingRights(),
      '-',
      state.halfmove,
      state.fullmove,
    ].join(' ');
    return fen;
  },

  setTurn(turn = undefined) {
    set((state) => {
      const newTurn = turn ?? (state.turn === 'w' ? 'b' : 'w');
      return { turn: newTurn };
    });
  },

  _getCastlingRights() {
    const cr = Object.entries(get().castling)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join('');
    return cr === '' ? '-' : cr;
  },

  setCastlingRight(id, value) {
    set((state) => ({ castling: { ...state.castling, [id]: value } }));
  },

  setFen(input) {
    const state = get();
    if (input !== state.fen() && state._isValidInput(input)) {
      const newState = input.split(' ');
      set({
        fenPosition: newState[0],
        turn: newState[1],
        castling: Object.keys(get().castling).reduce((acc, key) => {
          acc[key] = newState[2].includes(key);
          return acc;
        }, {}),
        halfmove: newState[4],
        fullmove: newState[5],
      });
    } else {
      state.fenInputRef.current.value = state.fen();
    }
  },

  _isValidInput(input) {
    const validation = validateFen(input);
    const validErrors = [
      'Invalid FEN: some pawns are on the edge rows',
      'Invalid FEN: missing white king',
      'Invalid FEN: missing black king',
    ];
    if (validation.ok || validErrors.includes(validation.error)) {
      return true;
    } else {
      return false;
    }
  },

  isFenAnalysable() {
    get().setFen(get().fenInputRef.current.value);
    return get().isLegalFen();
  },

  resetFen(cr) {
    set({
      fenPosition: cr
        ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
        : '8/8/8/8/8/8/8/8',
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
  },
*/
});
