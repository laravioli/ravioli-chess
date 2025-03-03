import { Protocol } from './protocol';
import { CevalState, sharedWasmMemory, maxHash } from './util';

export class StockfishWebEngine {
  constructor(info) {
    this.info = info;
    this.status = (status = {}) => {
      if (status.error) {
        console.log(status.error);
      }
    };
    this.protocol = new Protocol();
    this.boot().catch((e) => {
      this.failed = e;
      this.status?.({ error: String(e) });
    });
  }

  getInfo() {
    return this.info;
  }

  async boot() {
    const makeModule = await import('./assets/sf16-7.js');
    const module = await makeModule.default({
      wasmMemory: sharedWasmMemory(this.info.minMem),
      onError: (msg) => Promise.reject(new Error(msg)),
    });
    if (this.info.tech === 'NNUE') {
      this.store = undefined;
      module.onError = this.makeErrorHandler(module);
      const nnueFilenames = this.info.assets.nnue ?? [];
      if (!nnueFilenames.length)
        for (let i = 0; ; i++) {
          const nnueFilename = module.getRecommendedNnue(i);
          if (!nnueFilename || nnueFilenames.includes(nnueFilename)) break;
          nnueFilenames.push(nnueFilename);
        }
      (await this.getModels(nnueFilenames)).forEach((nnueBuffer, i) =>
        module.setNnueBuffer(nnueBuffer, i)
      );
    }
    module.listen = (data) => this.protocol.received(data);
    this.protocol.connected((cmd) => {
      //debug
      console.log(`send : ${cmd}`);
      //
      module.uci(cmd);
    });
    this.module = module;
  }

  getModels(nnueFilenames) {
    return Promise.all(
      nnueFilenames.map(async (nnueFilename) => {
        const storedBuffer = await this.store
          ?.get(nnueFilename)
          .catch(() => undefined);

        if (storedBuffer && storedBuffer.byteLength > 128 * 1024)
          return storedBuffer;
        const req = new XMLHttpRequest();

        req.open('get', `./src/stockfish/assets/${nnueFilename}`, true);
        req.responseType = 'arraybuffer';
        req.onprogress = (e) =>
          this.status?.({ download: { bytes: e.loaded, total: e.total } });

        const nnueBuffer = await new Promise((resolve, reject) => {
          req.onerror = () =>
            reject(new Error(`fetch '${nnueFilename}' failed: ${req.status}`));
          req.onload = () => {
            if (req.status / 100 === 2) resolve(new Uint8Array(req.response));
            else
              reject(
                new Error(`fetch '${nnueFilename}' failed: ${req.status}`)
              );
          };
          req.send();
        });
        this.status?.();
        this.store
          ?.put(nnueFilename, nnueBuffer)
          .catch(() => console.warn('IDB store failed'));
        return nnueBuffer;
      })
    );
  }

  makeErrorHandler(module) {
    return (msg) => {
      if (msg.startsWith('BAD_NNUE') && this.store) {
        // if we got this from IDB, we must remove it. but wait for getModels::store.put to finish first
        const index = Math.max(0, Number(msg.slice(9)));
        const nnueFilename =
          this.info.assets.nnue ?? module.getRecommendedNnue(index);
        setTimeout(() => {
          console.warn(`Corrupt NNUE file, removing ${nnueFilename} from IDB`);
          this.store?.remove(nnueFilename);
        }, 2000);
      } else this.status?.({ error: msg });
    };
  }

  getState() {
    return this.failed
      ? CevalState.Failed
      : !this.module
      ? CevalState.Loading
      : this.protocol.isComputing()
      ? CevalState.Computing
      : CevalState.Idle;
  }

  start = (work) => this.protocol.compute(work);
  stop = () => this.protocol.compute(undefined);
  engineName = () => this.protocol.engineName;
  destroy = () => {
    this.module?.uci('quit');
    this.module = undefined;
  };
}

const info = {
  id: '__sf16nnue7',
  name: 'Stockfish 16 NNUE · 7MB',
  short: 'SF 16 · 7MB',
  tech: 'NNUE',
  requires: ['sharedMem', 'simd', 'dynamicImportFromWorker'],
  cloudEval: false,
  assets: {
    root: 'assets',
    js: 'sf16-7',
  },
  minMem: 1536,
  maxHash,
  minThreads: 2,
  maxThreads: 32,
};

export const makeEngine = () => {
  return new StockfishWebEngine(info);
};
