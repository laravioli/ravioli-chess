//https://github.com/lichess-org/lila/blob/master/ui/lib/src/ceval/engines/stockfishWebEngine.ts
import { Protocol } from './protocol';
import { CevalState, sharedWasmMemory, maxHash, browserSupport, fewerCores } from './utils';
import { clamp } from '../common';
import type { BrowserEngineInfo, EngineNotifier, StockfishWeb, Work } from './interface.js';

export class StockfishWebEngine {
  failed?: Error;
  protocol: Protocol;
  module?: StockfishWeb;
  info: BrowserEngineInfo;
  status: EngineNotifier;

  constructor(info: BrowserEngineInfo) {
    this.info = info;
    this.status = (status = {}) => {
      if (status.error) {
        console.log(status.error);
      }
    };
    this.protocol = new Protocol();
    this.boot().catch(e => {
      this.failed = e;
      this.status?.({ error: String(e) });
    });
  }

  getInfo() {
    return this.info;
  }

  async boot() {
    const makeModule = await import('./stockfish/sf16-7.js');
    const module: StockfishWeb = await makeModule.default({
      wasmMemory: sharedWasmMemory(this.info.minMem!),
      onError: (msg: string) => Promise.reject(new Error(msg)),
    });
    if (this.info.tech === 'NNUE') {
      module.onError = this.makeErrorHandler();
      const nnueFilenames: string[] = this.info.assets.nnue ?? [];
      if (!nnueFilenames.length)
        for (let i = 0; ; i++) {
          const nnueFilename = module.getRecommendedNnue(i);
          if (!nnueFilename || nnueFilenames.includes(nnueFilename)) break;
          nnueFilenames.push(nnueFilename);
        }
      (await this.getModels(nnueFilenames)).forEach((nnueBuffer, i) => module.setNnueBuffer(nnueBuffer!, i));
    }
    module.listen = data => this.protocol.received(data);
    this.protocol.connected(cmd => {
      //debug
      //console.log(`send : ${cmd}`);
      //
      module.uci(cmd);
    });
    this.module = module;
  }

  getModels(nnueFilenames: string[]): Promise<(Uint8Array | undefined)[]> {
    return Promise.all(
      nnueFilenames.map(async nnueFilename => {
        const req = new XMLHttpRequest();

        req.open('get', `./static/nnue/${nnueFilename}`, true);
        req.responseType = 'arraybuffer';
        req.onprogress = e => this.status?.({ download: { bytes: e.loaded, total: e.total } });

        const nnueBuffer = await new Promise<Uint8Array>((resolve, reject) => {
          req.onerror = () => reject(new Error(`fetch '${nnueFilename}' failed: ${req.status}`));
          req.onload = () => {
            if (req.status / 100 === 2) resolve(new Uint8Array(req.response));
            else reject(new Error(`fetch '${nnueFilename}' failed: ${req.status}`));
          };
          req.send();
        });
        this.status?.();

        return nnueBuffer;
      }),
    );
  }

  makeErrorHandler() {
    return (msg: string) => {
      if (msg.startsWith('BAD_NNUE')) {
        setTimeout(() => {
          console.warn('Corrupt NNUE file');
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

  start = (work: Work) => this.protocol.compute(work);
  stop = () => this.protocol.compute(undefined);
  engineName = () => this.protocol.engineName;
  destroy = () => {
    this.module?.uci('quit');
    this.module = undefined;
  };
}

const sf16: BrowserEngineInfo = {
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
  return new StockfishWebEngine(sf16);
};

export const engineSupported = () => sf16.requires.every(req => browserSupport().includes(req));

export const getRecommendedThreads = () => {
  return clamp(navigator.hardwareConcurrency - (navigator.hardwareConcurrency % 2 ? 0 : 1), {
    min: sf16.minThreads ?? 1,
    max: maxThreads(),
  });
};

export const maxThreads = () => {
  return fewerCores()
    ? Math.min(sf16.maxThreads ?? 32, navigator.hardwareConcurrency)
    : (sf16.maxThreads ?? 2);
};
