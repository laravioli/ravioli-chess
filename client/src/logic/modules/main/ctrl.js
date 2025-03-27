import { DEFAULT_POSITION } from 'chess.js';
import { Analyse } from '../analyse';
import { Editor } from '../editor';

//todo : check function arguments (change how function pass arguments)
//explore how the controller api could be implemented
//separe editor from analyse
export class MainController {
  constructor(name, store) {
    window.controller = this;
    this.store = store;
    this.loader = this.#makeLoader().bind(this);
    this.loader(name, {
      fen: DEFAULT_POSITION,
      store: store,
    });
  }

  setModule(moduleName, fen = DEFAULT_POSITION) {
    console.log('try set module');
    if (this.module.name !== moduleName) {
      console.log('effectively change module');
      this.loader(moduleName, {
        fen: fen,
        store: this.store,
      });
    }
  }

  #makeLoader() {
    const modules = [
      {
        name: 'analysis',
        loaded: undefined,
        make: (info) => new Analyse(info),
      },
      {
        name: 'editor',
        loaded: undefined,
        make: (info) => new Editor(info),
      },
    ];

    return function (name, info) {
      const module = modules.find((mod) => mod.name === name);
      try {
        if (!module.loaded) {
          module.loaded = module.make({ name, ...info });
        } else {
          module.loaded.onLoad(info.fen);
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (this.module) this.module.onUnLoad();
        this.module = module.loaded;
      }
    };
  }
}
