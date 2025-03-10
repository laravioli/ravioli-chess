import chessBoard from 'chessboard';
import { DEFAULT_POSITION } from 'chess.js';
import { Analyse } from './subcontrollers/analyse';

export class MainController {
  constructor(mode, stores) {
    this.mode = mode;
    this.stores = stores;
    this.#selectCtrl(mode, { fen: DEFAULT_POSITION, stores: stores });
  }

  setMode(mode, initalFen = DEFAULT_POSITION) {
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

  setBoard(div, config) {
    if (this.ctrl.board) this.destroyBoard();
    this.ctrl.setBoard(chessBoard(div, config));
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
      this.ctrl.setboardCfg();
    } else {
      this.#selectCtrl(mode, info);
    }
  }

  #selectCtrl(mode, info) {
    this.ctrl?.destroyBoard();
    const make = this.#makeCtrl(mode);
    this.ctrl = make(info);
    this.ctrl.setboardCfg();
  }

  #makeCtrl(mode) {
    const controllers = [
      {
        mode: 'analyse',
        make: (info) => new Analyse(info),
      },
    ];
    const selected = controllers.find((ctrl) => ctrl.mode === mode);
    return selected.make;
  }
}
