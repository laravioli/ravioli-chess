export const createGameSlice = (set, get) => ({
  gameApi: {
    game: () => get().logic().game,
    newGame: () => get().logic().newGame(get().fen()),
    currentMove: () => get().logic().game?.currentMove,
    move: (source, target) => get().logic().game?.move(source, target),
    jump: (action) => {
      const game = get().logic().game;
      if (game) {
        get().logic().jump(action);
        get().boardApi.setBoardPosition(game.currentMove.fen);
        get().setFenSliceFromGame(game);
      }
    },
  },
});
