import { DEFAULT_POSITION } from 'chess.js';
import { Analyse } from './subcontrollers/analyse';

export class ChessController {
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
    const make = this.#makeCtrl(mode);
    this.ctrl = make(info);
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
