import { action, computed, observable } from 'mobx';
import { Chessground } from '@lichess-org/chessground';
import { opposite } from '@lichess-org/chessground/util';
import type { Api as ChessgroundApi } from '@lichess-org/chessground/api';

import { Fen } from './fen';
import type { EditorOpts } from './interface';

export class EditorStore {
  opts: EditorOpts;
  board: ChessgroundApi | undefined;
  fen: Fen;

  @observable accessor isFlipped = false;

  constructor(opts: EditorOpts) {
    this.opts = opts;
    this.fen = new Fen(opts.fen);
  }

  /* Loader */

  @action
  onLoad() {}

  @action
  onUnLoad() {}

  /* Board */

  mountBoard(div: HTMLElement) {
    const config = this.makeBoardCfg();
    this.board = Chessground(div, config);
  }

  @action
  flip() {
    this.board?.toggleOrientation();
    this.isFlipped = !this.isFlipped;
  }

  @computed
  get orientation() {
    return this.isFlipped ? opposite(this.opts.orientation) : this.opts.orientation;
  }

  onUnMountBoard() {
    this.board?.destroy();
  }

  makeBoardCfg = (): CgConfig => {
    return {
      fen: this.fen.current,
      orientation: this.opts.orientation,
      autoCastle: false,
      movable: {
        free: true,
        color: 'both',
      },
      premovable: {
        enabled: false,
      },
      drawable: {
        enabled: true,
      },
      draggable: {
        showGhost: true,
        deleteOnDropOff: true,
      },
      highlight: {
        lastMove: false,
      },
      selectable: {
        enabled: false,
      },
      events: {
        change: action(() => {
          this.fen.boardFen = this.board!.getFen();
        }),
      },
    };
  };

  /* Fen */

  @action
  setFen(fen: FEN) {
    this.fen.set(fen, () => this._updateBoard(fen));
  }

  @action
  _updateBoard(fen: FEN) {
    if (this.board) {
      this.board.set({ fen: fen });
      this.fen.boardFen = this.board.getFen();
    }
  }
}
