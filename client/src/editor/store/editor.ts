import { action, runInAction } from 'mobx';
import { Chessground } from '@lichess-org/chessground';
import { Fen } from './fen';

export class EditorStore {
  board = undefined;
  fen = undefined;

  constructor(rootStore, { fen }) {
    runInAction(() => {
      this.ui = rootStore.uiStore;
      this.fen = new Fen(fen);
    });
  }

  //Loader

  @action
  onLoad() {}

  @action
  onUnLoad() {}

  //Board

  mountBoard(div) {
    const config = this.makeBoardCfg();
    this.board = Chessground(div, config);
  }

  onUnMountBoard() {
    this.board.destroy();
  }

  makeBoardCfg = () => {
    return {
      fen: this.fen.current,
      orientation: this.ui.orientation,
      autoCastle: false,
      drawable: {
        enabled: true,
      },
      draggable: {
        showGhost: true,
        deleteOnDropOff: true,
      },
      highlight: {
        lastMove: false,
        check: false,
      },
      selectable: {
        enabled: false,
      },
      events: {
        change: action(() => {
          this.fen.boardFen = this.board.getFen();
        }),
      },
    };
  };

  //Fen

  @action
  setFen(fen) {
    this.fen.set(fen, () => this._updateBoard(fen));
  }

  @action
  _updateBoard(fen) {
    if (this.board) {
      this.board.set({ fen: fen });
      this.fen.boardFen = this.board.getFen();
    }
  }
}
