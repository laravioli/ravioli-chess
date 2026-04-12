//https://github.com/lichess-org/lila/blob/master/ui/lib/src/ceval/engines/stockfishWebEngine.ts
import { clamp } from '@/lib/common.ts';
import { maxThreads, maxHash, features as browserSupport } from './utils.ts';
import type { BrowserEngineInfo, CevalEngine } from './interface.ts';
import { StockfishWebEngine } from './stockfishWebEngine.ts';

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
      assets: { ...base.info.assets, js: base.info.assets.js?.replace('.js', '_relaxed-simd.js') },
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

const makeEngineMap = (): Map<string, WithMake> => {
  const browserEngines: WithMake[] = [
    ...relaxedSimdPair({
      info: {
        id: '__sf_18_smallnet',
        name: 'Stockfish 18 · 15MB sscg13/threat-small',
        short: 'SF 18 · 15MB',
        tech: 'NNUE',
        requires: ['sharedMem', 'simd', 'dynamicImportFromWorker'],
        minMem: 1536,
        cloudEval: true,
        assets: {
          root: 'assets',
          nnue: ['nn-4ca89e4b3abf.nnue'],
          js: 'sf_18_smallnet.js',
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

const localEngineMap = makeEngineMap();
const localEngines = [...localEngineMap.values()].map((e) => e.info);

export function getEngineInfo(id: string) {
  const e = localEngines.find((e) => e.id === id);
  if (!e) throw Error(`Engine not found ${id}`);
  return e;
}
export const getRecommendedThreads = (id: string) => {
  const info = getEngineInfo(id);
  return clamp(navigator.hardwareConcurrency - (navigator.hardwareConcurrency % 2 ? 0 : 1), {
    min: info.minThreads ?? 1,
    max: maxThreads(info),
  });
};

export const makeEngine = (id: string): CevalEngine => {
  const e = getEngineInfo(id);
  return localEngineMap.get(e.id)!.make(e);
};
