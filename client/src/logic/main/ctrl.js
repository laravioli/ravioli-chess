import chessBoard from 'chessboard';
import { DEFAULT_POSITION } from 'chess.js';
import { Analyse } from './modules/analyse';

export class MainController {
  constructor(mode, stores) {
    this.mode = mode;
    this.stores = stores;
    this.#selectCtrl(mode, { fen: DEFAULT_POSITION, stores: stores });
  }

  setMode(mode, initalFen = DEFAULT_POSITION) {
    console.log('a');
    if (this.mode !== mode) {
      this.#activateCtrl(mode, { fen: initalFen, stores: this.stores });
      this.mode = mode;
      this.stores.ui.set({ mode: mode });
    }
  }

  getGame() {
    return this.ctrl?.game;
  }

  newGame(fen) {
    this.ctrl?.newGame(fen);
  }

  getBoard() {
    return this.ctrl?.board;
  }

  setBoard(div) {
    if (this.ctrl.board) this.destroyBoard();
    this.ctrl.setBoard(chessBoard(div, this.ctrl.makeboardCfg()));
    window.addEventListener('resize', this.ctrl.board.resize);
  }

  destroyBoard() {
    window.removeEventListener('resize', this.ctrl.board.resize);
    this.ctrl.board.destroy();
    this.ctrl.setBoard(undefined);
  }

  jump(action) {
    this.ctrl?.jump(action);
  }

  #activateCtrl(mode, info) {
    if (
      (this.mode === 'editor' && mode === 'analyse') ||
      (this.mode === 'analyse' && mode === 'editor')
    ) {
      this.ctrl.updateStatus(mode, info.fen);
    } else {
      this.#selectCtrl(mode, info);
    }
  }

  #selectCtrl(mode, info) {
    this.ctrl?.destroyBoard();
    const make = this.#makeCtrl(mode);
    this.ctrl = make(info);
  }

  #makeCtrl(mode) {
    const controllers = [
      {
        mode: 'analyse',
        make: (info) => new Analyse(this, info),
      },
    ];
    const selected = controllers.find((ctrl) => ctrl.mode === mode);
    return selected.make;
  }
}
