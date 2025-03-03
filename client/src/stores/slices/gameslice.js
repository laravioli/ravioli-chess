export const createGameSlice = (ctrl) => (set, get) => ({
  gameApi: {
    setMode: (mode, fen) => ctrl.setMode(mode, fen),
    newGame: () => ctrl.loadGame(get().fen()),
    getChessInstance: () => ctrl.getChessInstance(),
    getCurrentMove: () => ctrl.getCurrentMove(),
    move: (source, target) => ctrl.move(source, target),
    jump: (action) => {
      ctrl.jump(action);
      get().boardApi.setBoardPosition(ctrl.getCurrentMove().fen);
      get().setFenSliceFromGame(ctrl.getChessInstance());
    },
  },
});
