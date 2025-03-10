import chessBoard from 'chessboard';

export const createBoardSlice = (set, get) => ({
  board: undefined,
  boardApi: {
    startBoard: () => get().board?.start(),

    clearBoard: () => get().board?.clear(),

    flipBoard: () => get().board?.flip(),

    getBoardFen: () => get().board?.fen(),

    setBoardPosition: (fen) => get().board?.position(fen, true),

    destroyBoard: () => {
      window.removeEventListener('resize', get().board.resize);
      get().board.destroy();
      set({ board: undefined });
    },
  },

  setBoard: (div) => {
    if (get().board) {
      window.removeEventListener('resize', get().board.resize);
      get().board.destroy();
    }
    const board = chessBoard(div, makeConfig(get));
    window.addEventListener('resize', board.resize);
    set({ board: board });
  },
});

function makeConfig(get) {
  return { ...get().config, ...onMouseClick(get) };
}

/* eslint-disable no-unused-vars */
function onMouseClick(get) {
  let handlers = {};
  const state = get();

  if (state.mode === 'editor') {
    handlers['onDrop'] = (source, target, piece, newPos) => {
      get().setFenPositionFromEditor(get().board.objToFen(newPos));
    };
  }

  if (state.mode !== 'editor') {
    handlers = {
      ...get().logic().boardCfg(),
      onSnapEnd: () => get().gameApi.jump('move'),
    };
  }
  return handlers;
} //todo continue with analyse migration
