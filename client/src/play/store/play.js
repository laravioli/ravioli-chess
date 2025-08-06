import { Chessground } from "@lichess-org/chessground";
import { Fen } from "src/lib/fen/fen";
import { action, runInAction } from "mobx";

export class PlayStore {
  board = undefined;
  fen = undefined;

  constructor(rootStore, { fen }) {
    runInAction(() => {
      this.rootStore = rootStore;
      this.fen = new Fen(fen);
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
