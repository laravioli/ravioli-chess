//https://github.com/lichess-org/lila/blob/master/ui/lib/src/ceval/engines/stockfishWebEngine.ts
import { clamp } from '@/lib/common';
import { maxThreads, maxHash, features as browserSupport } from './utils';
import { type BrowserEngineInfo, CevalEngine } from './interface';
import { StockfishWebEngine } from './stockfishWeb';

type WithMake = {
  info: BrowserEngineInfo;
  make: (e: BrowserEngineInfo) => CevalEngine;
};

const relaxedSimdPair = (base: WithMake): [WithMake, WithMake] => [
  {
    ...base,
    info: {
      ...base.info,
      id: `${base.info.id}_relaxed-simd`,
      requires: [...base.info.requires, 'relaxedSimd'],
      assets: { ...base.info.assets, js: base.info.assets.js?.concat('_relaxed-simd') },
    },
  },
  { ...base, info: { ...base.info, obsoletedBy: 'relaxedSimd' } },
];

export const withDefaults = (engine: BrowserEngineInfo): BrowserEngineInfo => ({
  minMem: 1024,
  maxHash,
  minThreads: 2,
  maxThreads: 32,
  ...engine,
});

export class Engines {
  engineMap: Map<string, WithMake>;
  engineArrayInfo: Array<BrowserEngineInfo>;
  private selected: BrowserEngineInfo | undefined;

  constructor() {
    this.engineMap = this.makeEngineMap();
    this.engineArrayInfo = [...this.engineMap.values()].map((e) => e.info);
    this.selected = this.engineArrayInfo[0];
  }

  makeEngineMap = (): Map<string, WithMake> => {
    const browserEngines: WithMake[] = [
      ...relaxedSimdPair({
        info: {
          id: '__sf_18_smallnet',
          name: 'Stockfish 18 · 15MB sscg13/threat-small',
          short: 'SF 18',
          tech: 'NNUE',
          requires: ['sharedMem', 'simd', 'dynamicImportFromWorker'],
          minMem: 1536,
          cloudEval: false,
          assets: {
            root: 'assets',
            nnue: ['nn-4ca89e4b3abf.nnue'],
            js: 'sf_18_smallnet',
          },
        },
        make: (e: BrowserEngineInfo) => new StockfishWebEngine(e),
      }),
    ];

    return new Map<string, WithMake>(
      browserEngines
        .filter(
          (e) =>
            e.info.requires.every((req) => browserSupport().includes(req)) &&
            !(e.info.obsoletedBy && browserSupport().includes(e.info.obsoletedBy)),
        )
        .map((e) => [e.info.id, { info: withDefaults(e.info), make: e.make }]),
    );
  };

  make = (): CevalEngine => {
    if (!this.selected) throw Error('select an Engine first');
    return this.engineMap.get(this.selected.id)!.make(this.selected);
  };

  select(id: string): BrowserEngineInfo {
    const e = this.engineArrayInfo.find((e) => e.id === id);
    if (!e) throw Error(`Engine not found ${id}`);
    this.selected = e;
    return e;
  }

  getSelected = () => this.selected;
}

export const getRecommendedThreads = (info: BrowserEngineInfo) => {
  return clamp(navigator.hardwareConcurrency - (navigator.hardwareConcurrency % 2 ? 0 : 1), {
    min: info.minThreads ?? 1,
    max: maxThreads(info.maxThreads),
  });
};
