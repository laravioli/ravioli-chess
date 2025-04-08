import { Analyse } from 'src/analyse/logic/analyse';
import { Editor } from 'src/editor/logic/editor';
import { Fen } from 'src/lib/fen/fen';

export class Controller {
  modules = new Map([
    ['analysis', { make: (opts) => new Analyse(opts), instance: undefined }],
    ['editor', { make: (opts) => new Editor(opts), instance: undefined }],
  ]);
  fen = new Fen();

  constructor(id, store) {
    this.store = store;
    this.setModule(id, { fen: this.fen, store });
    this.current = id;
  }

  setModule(id, opts) {
    opts.fen = this.fen; //test
    if (this.current !== id) {
      this.modules.get(this.current)?.instance?.onUnLoad(id);
      const module = this.modules.get(id);
      if (module) {
        if (module.instance) {
          module.instance.onLoad(opts.fen.fen());
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
