import { chessController } from './logic/game/gameCtrl';

export const createGameSlice = (set, get) => ({
  getGame: () => chessController.getGame(),
  gameApi: {
    newGame: () => chessController.newGame(get().fen()),
    history: (action) => get().reducerHistory(action),
  },

  reducerHistory(action) {
    switch (action) {
      case 'undo':
        chessController.game?.gameHistory.undo();
        break;
      case 'redo':
        chessController.game?.gameHistory.redo();
        break;
      case 'start':
        chessController.game?.gameHistory.reset('start');
        break;
      case 'end':
        chessController.game?.gameHistory.reset('end');
        break;
      case 'move':
        chessController.game?.gameHistory.move();
        break;
    }
    get().boardApi.setBoardPosition(chessController.getGame()?.fen());
    get().setFenSliceFromGame(chessController.getGame());
  },
});
