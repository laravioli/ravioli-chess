export const createBoardSlice = (set, get) => ({
  board: undefined,
  startBoard: () => get().board?.start(),
  clearBoard: () => get().board?.clear(),
  destroyboard: () => {
    window.removeEventListener('resize', get().board.resize);
    get().board?.destroy();
    set({ board: null });
  },
  flipBoard: () => get().board?.flip(),
  boardPosition: () => get().board?.fen(),
});
