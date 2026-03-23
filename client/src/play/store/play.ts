import { action } from 'mobx';
import { Chessground } from '@lichess-org/chessground';
import type { Api as ChessgroundApi } from '@lichess-org/chessground/api';

import type { GlobalStore } from '@/core/store/stores';

import type { PlayOpts } from './interface';

export class PlayStore {
  globalStore: GlobalStore;
  board: ChessgroundApi | undefined;

  opts: PlayOpts;

  constructor(globalStore: GlobalStore, opts: PlayOpts) {
    this.opts = opts;
    this.globalStore = globalStore;
  }

  @action
  onLoad() {
    this.globalStore.ceval.destroy();
  }

  @action
  onUnLoad() {}

  mountBoard(div: HTMLElement) {
    const config = this.makeBoardCfg();
    this.board = Chessground(div, config);
  }

  flip() {
    this.board?.toggleOrientation();
  }

  onUnMountBoard() {
    this.board?.destroy();
    this.board = undefined;
  }

  @action
  jump() {}

  makeBoardCfg = () => {
    return {};
  };
}
