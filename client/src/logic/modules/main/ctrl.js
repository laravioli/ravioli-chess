import chessBoard from 'chessboard';
import { DEFAULT_POSITION } from 'chess.js';
import { Analyse } from '../analyse';

export class MainController {
  constructor(moduleName, stores) {
    //window.controller = this;
    this.stores = stores;
    this.#selectModule({
      name: moduleName,
      fen: DEFAULT_POSITION,
      stores: stores,
    });
  }

  setModule(moduleName, fen = DEFAULT_POSITION) {
    if (this.module.name !== moduleName) {
      this.#activateModule(moduleName, {
        name: moduleName,
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

  #activateModule(moduleName, info) {
    if (
      (this.module.name === 'editor' && moduleName === 'analysis') ||
      (this.module.name === 'analysis' && moduleName === 'editor')
    ) {
      this.module.updateStatus(moduleName, info.fen);
    } else {
      this.#selectModule(moduleName, info);
    }
  }

  #selectModule({ name, fen, stores }) {
    this.module?.destroyBoard();
    const make = this.#makeModule(name);
    this.module = make({ name, fen, stores });
  }

  #makeModule(name) {
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
    const selected = controllers.find((module) => module.name === name);
    return selected.make;
  }
}
