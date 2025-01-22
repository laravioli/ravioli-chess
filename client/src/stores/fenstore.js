import { validateFen as vf } from 'chess.js';

export const createFenSlice = (set, get) => ({
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
  isLegalFen: true,

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

  _getCastlingRights() {
    const cr = Object.entries(get().castling)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join('');
    return cr === '' ? '-' : cr;
  },

  setFenPositionFromEditor(fenPosition) {
    set({ fenPosition });
    set({ isLegalFen: vf(get().fen()).ok });
  },

  setTurn(turn = undefined) {
    set((state) => {
      const newTurn = turn ?? (state.turn === 'w' ? 'b' : 'w');
      return { turn: newTurn };
    });
  },

  setCastlingRight(id, value) {
    set((state) => ({ castling: { ...state.castling, [id]: value } }));
  },

  setFenSliceFromInput() {
    const state = get();
    const input = state.fenInputRef.current.value;
    if (input !== state.fen() && state._isValidInput(input)) {
      const newstate = input.split(' ');
      set({
        fenPosition: newstate[0],
        turn: newstate[1],
        castling: Object.keys(get().castling).reduce((acc, key) => {
          acc[key] = newstate[2].includes(key);
          return acc;
        }, {}),
        halfmove: newstate[4],
        fullmove: newstate[5],
      });
      get().boardApi.setBoardPosition(input);
    } else {
      state.fenInputRef.current.value = state.fen();
    }
  },

  _isValidInput(input) {
    const validation = vf(input);
    const validErrors = [
      'Invalid FEN: some pawns are on the edge rows',
      'Invalid FEN: missing white king',
      'Invalid FEN: missing black king',
    ];
    if (validation.ok || validErrors.includes(validation.error)) {
      set({ isLegalFen: validation.ok });
      return true;
    } else {
      return false;
    }
  },

  setFenSliceContinue() {
    get().setFenSliceFromInput();
    return get().isLegalFen;
  },

  setFenSliceFromChess(chess) {
    const castlingRights =
      chess.turn() === 'w'
        ? chess.getCastlingRights('b')
        : Object.fromEntries(
            Object.entries(chess.getCastlingRights('w')).map(([key, value]) => [
              key.toUpperCase(),
              value,
            ])
          );
    set((state) => ({
      fenPosition: chess.fen().split(' ')[0],
      turn: chess.turn(),
      castling: { ...state.castling, ...castlingRights },
      halfmove: chess.fen().split(' ')[4],
      fullmove: chess.moveNumber(),
    }));
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
});
