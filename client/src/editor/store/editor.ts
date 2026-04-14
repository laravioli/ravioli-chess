import { action, computed, observable } from 'mobx';
import { Chessground } from '@lichess-org/chessground';
import { opposite } from '@lichess-org/chessground/util';
import type { Api as ChessgroundApi } from '@lichess-org/chessground/api';

import { wsConnect } from '@/lib/socket';

import { Fen } from './fen';
import type { EditorOpts, EditorSettings } from './interface';

export class EditorStore {
  board: ChessgroundApi | undefined;
  fen: Fen;

  @observable accessor isFlipped = false;

  private readonly opts: EditorOpts;
  private readonly settings: EditorSettings;

  constructor(opts: EditorOpts, settings: EditorSettings) {
    this.opts = opts;
    this.settings = settings;
    this.fen = new Fen(opts.fen);
  }

  /* Loader */

  @action
  onLoad() {
    wsConnect('/socket/site', { receive: this.settings.socketReceive });
  }

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
