//https://github.com/lichess-org/lila/blob/master/ui/lib/src/ceval/engines/stockfishWebEngine.ts
import { bigFileStorage } from '@/lib/bigFileStorage';
import { Protocol } from './protocol';
import { sharedWasmMemory } from './utils';
import type {
  BrowserEngineInfo,
  EngineNotifier,
  StockfishWeb,
  Work,
  CevalState,
} from './interface.ts';

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
    const makeModule = await import(`./stockfish/${this.info.assets.js}.js`);
    const module: StockfishWeb = await makeModule.default({
      wasmMemory: sharedWasmMemory(this.info.minMem!),
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
          module.setNnueBuffer(
            await bigFileStorage().get(
              import.meta.env.BASE_URL.concat(`nnue/${name}`),
              (bytes, total) => this.status?.({ download: { bytes, total } }),
            ),
            index,
          );
        }),
      );
    }
    module.listen = (data: string) => this.protocol.received(data);
    this.protocol.connected((cmd) => {
      module.uci(cmd);
    });
    this.module = module;
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
