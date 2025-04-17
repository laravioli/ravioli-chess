import { Analyse } from 'src/analyse/logic/analyse';
import { Editor } from 'src/editor/logic/editor';
import { Fen } from 'src/lib/fen/fen';
import { proxy } from 'valtio';
import { DEFAULT_POSITION } from 'chess.js';

export class Controller {
  modules = new Map([
    [
      'analysis',
      {
        make: (opts, deps) => proxy(new Analyse(opts, deps)),
        instance: undefined,
      },
    ],
    [
      'editor',
      {
        make: (opts, deps) => proxy(new Editor(opts, deps)),
        instance: undefined,
      },
    ],
  ]);

  globals = new Map([
    ['fen', { make: (fen) => new Fen(fen), instance: undefined }],
  ]);

  constructor(id) {
    this.setGlobal({ initialFen: DEFAULT_POSITION });
    this.setModule(id, { fen: DEFAULT_POSITION });
    this.current = id;
  }

  setModule(id, opts) {
    if (this.current !== id) {
      this.modules.get(this.current)?.instance?.onUnLoad(id);
      const module = this.modules.get(id);
      if (module) {
        if (module.instance) {
          module.instance.onLoad(opts.fen);
        } else {
          module.instance = module.make(opts, { fen: this.getGlobal('fen') });
        }
        this.current = id;
        window.module = module.instance;
      }
    }
  }

  getModule(id) {
    return this.modules.get(id)?.instance;
  }

  setGlobal(opts) {
    const fenLib = this.globals.get('fen');
    fenLib.instance = fenLib.make(opts.initialFen);
  }

  getGlobal(id) {
    return this.globals.get(id)?.instance;
  }
}
