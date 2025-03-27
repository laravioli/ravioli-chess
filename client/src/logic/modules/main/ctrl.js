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
    console.log('try set module');
    if (this.module.name !== moduleName) {
      console.log('effectively change module');
      this.#activateModule(moduleName, {
        fen: fen,
        stores: this.stores,
      });
    }
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
    if (!this.module) console.log('initial module settings');
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
