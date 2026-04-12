//https://github.com/lichess-org/lila/blob/master/ui/lib/src/ceval/engines/stockfishWebEngine.ts
import { Protocol } from './protocol.ts';
import { sharedWasmMemory } from './utils.ts';
import type {
  BrowserEngineInfo,
  EngineNotifier,
  StockfishWeb,
  Work,
  CevalState,
} from './interface.ts';

type U8 = Uint8Array<ArrayBuffer>;

export class StockfishWebEngine {
  readonly info: BrowserEngineInfo;
  readonly status: EngineNotifier;
  failed: Error;
  protocol: Protocol;
  module?: StockfishWeb;

  constructor(info: BrowserEngineInfo) {
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

  getInfo(): BrowserEngineInfo {
    return this.info;
  }

  async boot(): Promise<void> {
    const scriptUrl =
      document.location + 'static/src/lib/eval/stockfish/' + `${this.info.assets.js}`;
    const makeModule = await import(scriptUrl);
    const module: StockfishWeb = await makeModule.default({
      wasmMemory: sharedWasmMemory(this.info.minMem!),
      locateFile: (file: string) => document.location + 'static/src/lib/eval/stockfish/' + file,
      mainScriptUrlOrBlob: scriptUrl,
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
      await Promise.all(
        nnueFilenames.map(async (name, index) => {
          module.setNnueBuffer(await this.getModel(`./static/nnue/${name}`), index);
        }),
      );
    }
    module.listen = (data: string) => this.protocol.received(data);
    this.protocol.connected((cmd) => module.uci(cmd));
    this.module = module;
  }

  getModel = async (assetUrl: string): Promise<U8> => {
    const fetched = await new Promise<U8>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let settled = false;

      const settle = (value: U8) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };
      const fail = (message: string) => {
        if (settled) return;
        settled = true;
        reject(new Error(message));
      };

      xhr.open('GET', assetUrl, true);
      xhr.responseType = 'arraybuffer';

      xhr.onerror = () => fail(`fetch '${assetUrl}' failed: ${xhr.status}`);
      xhr.onabort = () => fail(`fetch '${assetUrl}' aborted`);
      xhr.onload = () => {
        if (Math.floor(xhr.status / 100) === 2) settle(new Uint8Array(xhr.response));
        else fail(`fetch '${assetUrl}' failed: ${xhr.status}`);
      };

      xhr.send();
    });
    return fetched;
  };

  makeErrorHandler() {
    return (msg: string) => {
      if (msg.startsWith('BAD_NNUE')) {
        setTimeout(() => {
          console.warn('Corrupt NNUE file');
        }, 2000);
      } else this.status?.({ error: msg });
    };
  }

  getState(): CevalState {
    return this.failed
      ? 'Failed'
      : !this.module
        ? 'Loading'
        : this.protocol.isComputing()
          ? 'Computing'
          : 'Idle';
  }

  start = (work: Work) => this.protocol.compute(work);
  stop = () => this.protocol.compute(undefined);
  engineName = () => this.protocol.engineName;
  destroy = () => {
    this.module?.uci('quit');
    this.module = undefined;
  };
}
