import { Chessground } from '@lichess-org/chessground';
import { action, runInAction } from 'mobx';

export class PlayStore {
  board = undefined;

  constructor(rootStore, { fen }) {
    runInAction(() => {
      this.rootStore = rootStore;
    });
  }

  @action
  onLoad() {}

  @action
  onUnLoad() {}

  mountBoard(div) {
    const config = this.makeBoardCfg();
    this.board = Chessground(div, config);
  }

  onUnMountBoard() {
    this.board.destroy();
  }

  @action
  jump() {}

  makeBoardCfg = () => {
    return {};
  };
}
