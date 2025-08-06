import { Chessground } from "@lichess-org/chessground";
import { Fen } from "src/lib/fen/fen";
import { action, runInAction } from "mobx";

export class EditorStore {
  board = undefined;
  fen = undefined;

  constructor(rootStore, { fen }) {
    runInAction(() => {
      this.ui = rootStore.uiStore;
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

  updateBoard(fen) {
    this.board.set({ fen: fen });
  }

  makeBoardCfg = () => {
    return {
      fen: this.fen.current,
      orientation: this.ui.orientation,
      highlight: {
        lastMove: false,
        check: false,
      },
      events: {
        move: action(() => {
          this.fen.position = this.board.getFen();
        }),
      },
    };
  };
}
