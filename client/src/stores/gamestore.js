import gameCtrl from './logic/game/ctrl';

export const createGameSlice = (set, get) => ({
  gameApi: {
    setMode: (mode, fen) => gameCtrl.setMode(mode, fen),
    newGame: () => gameCtrl.loadGame(get().fen()),
    getChessInstance: () => gameCtrl.getChessInstance(),
    getCurrentMove: () => gameCtrl.getCurrentMove(),
    move: (source, target) => gameCtrl.move(source, target),
    jump: (action) => {
      gameCtrl.jump(action);
      get().boardApi.setBoardPosition(gameCtrl.getCurrentMove().fen);
      get().setFenSliceFromGame(gameCtrl.getChessInstance());
    },
  },
});
