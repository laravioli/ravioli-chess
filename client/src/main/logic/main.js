import { Analyse } from 'src/analyse/logic/analyse';
import { Editor } from 'src/editor/logic/editor';
import { DEFAULT_POSITION } from 'chess.js';

export class Controller {
  modules = new Map([
    ['analysis', { make: (opts) => new Analyse(opts), instance: undefined }],
    ['editor', { make: (opts) => new Editor(opts), instance: undefined }],
  ]);

  constructor(id, store) {
    this.store = store;
    this.setModule(id, { fen: DEFAULT_POSITION, store });
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
          module.instance = module.make(opts);
        }
        this.current = id;
      }
    }
  }

  getModule(id) {
    return this.modules.get(id)?.instance;
  }
}
