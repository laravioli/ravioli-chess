import chessBoard from 'chessboard';
import { DEFAULT_POSITION } from 'chess.js';
import { Analyse } from '../analyse';

//todo : check function arguments (change how function pass arguments)
//explore how the controller api could be implemented
//separe editor from analyse
export class MainController {
  constructor(name, stores) {
    window.controller = this;
    this.stores = stores;
    this.#selectModule(name, {
      fen: DEFAULT_POSITION,
      stores: stores,
    });
  }

  setModule(moduleName, fen = DEFAULT_POSITION) {
    if (this.module.name !== moduleName) {
      this.#activateModule(moduleName, {
        fen: fen,
        stores: this.stores,
      });
    }
  }

  getGame() {
    return this.module?.game;
  }

  newGame(fen) {
    this.module?.newGame(fen);
  }

  getBoard() {
    return this.module?.board;
  }

  setBoard(div) {
    if (this.module.board) this.destroyBoard();
    this.module.setBoard(chessBoard(div, this.module.makeboardCfg()));
    window.addEventListener('resize', this.module.board.resize);
  }

  destroyBoard() {
    window.removeEventListener('resize', this.module.board.resize);
    this.module.board.destroy();
    this.module.setBoard(undefined);
  }

  jump(action) {
    this.module?.jump(action);
  }

  #activateModule(name, info) {
    if (
      (this.module.name === 'editor' && name === 'analysis') ||
      (this.module.name === 'analysis' && name === 'editor')
    ) {
      this.module.updateStatus(name, info.fen);
    } else {
      this.#selectModule(name, info);
    }
  }

  #selectModule(name, info) {
    this.module?.destroyBoard();
    const make = this.#moduleMaker(name);
    this.module = make({ name, ...info });
  }

  #moduleMaker(name) {
    const controllers = [
      {
        name: 'analysis',
        make: (info) => new Analyse(this, info),
      },
      {
        name: 'editor',
        make: (info) => {
          const module = new Analyse(this, info);
          module.updateStatus('editor', info.fen);
          return module;
        },
      },
    ];
    const selected = controllers.find((maker) => maker.name === name);
    return selected.make;
  }
}
