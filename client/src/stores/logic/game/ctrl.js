import { DEFAULT_POSITION } from 'chess.js';
import { Analyse } from './analyse';

class GameCtrl {
  constructor(mode) {
    this.mode = mode;
    this.#selectCtrl(mode, { fen: DEFAULT_POSITION });
  }

  setMode(mode, initalFen = DEFAULT_POSITION) {
    if (this.mode !== mode) {
      this.#activateCtrl(mode, { fen: initalFen });
      this.mode = mode;
    }
  }

  #makeCtrl(mode) {
    const controllers = [
      { mode: 'analyse', make: (info) => new Analyse(info) },
    ];
    const selected = controllers.find((ctrl) => ctrl.mode === mode);
    return selected.make;
  }

  #selectCtrl(mode, info) {
    const make = this.#makeCtrl(mode);
    this.ctrl = make(info);
  }

  #activateCtrl(mode, info) {
    if (this.mode === 'editor' && mode === 'analyse') {
      this.ctrl.loadPosition(info.fen);
    } else if (this.mode === 'analyse' && mode === 'editor') {
      this.ctrl.clear();
    } else {
      this.#selectCtrl(mode, info);
    }
  }

  loadGame(fen) {
    if (this.mode !== 'editor') this.ctrl.loadPosition(fen);
  }

  move(source, target) {
    this.ctrl.game?.chess.move({
      from: source,
      to: target,
      promotion: 'q',
    });
  }

  jump(action) {
    this.ctrl.jump(action);
  }

  getCurrentMove() {
    return this.ctrl.game?.getCurrentMove();
  }

  getChessInstance() {
    return this.ctrl.game?.chess;
  }
}

export default new GameCtrl('analyse');
