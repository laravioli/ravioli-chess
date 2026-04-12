//https://github.com/lichess-org/lila/blob/master/ui/lib/src/ceval/types.ts

import type { Path } from '../tree/interface';

export type Feature =
  | 'wasm'
  | 'sharedMem'
  | 'simd'
  | 'relaxedSimd'
  | 'dynamicImportFromWorker'
  | 'bigint'
  | 'structuredClone';

export type WinningChances = number;
export type SearchBy = { movetime: number } | { depth: number } | { nodes: number };
export type Search = {
  by: SearchBy;
  multiPv: number;
  indeterminate?: boolean;
};

export interface Work {
  threads: number;
  hashSize: number | undefined;
  gameId: string | undefined;
  stopRequested: boolean;

  path: string;
  search: SearchBy;
  multiPv: number;
  ply: number;
  initialFen: string;
  currentFen: string;
  moves: string[];
  emit: (ev: LocalEval) => void;
}

export interface BaseEngineInfo {
  id: string;
  name: string;
  short?: string;
  minThreads?: number;
  maxThreads?: number;
  maxHash?: number;
  requires?: Feature[];
}

export interface BrowserEngineInfo extends BaseEngineInfo {
  tech: 'HCE' | 'NNUE';
  short: string;
  minMem?: number;
  assets: {
    root?: string;
    js?: string;
    wasm?: string;
    version?: string;
    nnue?: string[];
  };
  requires: Feature[];
  obsoletedBy?: Feature;
  cloudEval?: boolean;
}

export type EngineNotifier = (status?: {
  download?: { bytes: number; total: number };
  error?: string;
}) => void;

//https://github.com/lichess-org/stockfish-web/blob/master/stockfishWeb.d.ts
export interface StockfishWeb {
  uci(command: string): void; // send uci command, receive async response via listen

  // index arguments are used for dual net sf builds, 0 for big, 1 for small, otherwise ignore

  setNnueBuffer(data: Uint8Array, index?: number): void; // load nnue as buffer

  getRecommendedNnue(index?: number): string; // returns a bare filename

  listen: (data: string) => void; // attach listener here

  onError: (msg: string) => void; // attach error handler here
}

export type Uci = string;
export type Ply = number;

export interface EvalScore {
  cp?: number;
  mate?: number;
}

export interface PvData extends EvalScore {
  moves: string[];
}

interface ClientEvalBase extends EvalScore {
  fen: FEN;
  depth: number;
  nodes: number;
  pvs: PvData[];
}

export interface LocalEval extends ClientEvalBase {
  cloud?: false;
  millis: number;
}
export type ClientEval = LocalEval;

export interface Step {
  ply: number;
  fen: string;
  san?: string;
  uci?: string;
  ceval?: ClientEval;
}

export interface Started {
  path: Path;
  steps: Step[];
  gameId: string | undefined;
}

export type CevalState = 'Initial' | 'Loading' | 'Idle' | 'Computing' | 'Failed';

export interface CevalEngine {
  getInfo(): BrowserEngineInfo;
  getState(): CevalState;
  start(work: Work): void;
  stop(): void;
  destroy(): void;
}

export interface CevalOpts {
  id: string;
  allowed: boolean;
  listening: boolean;
  initialFen?: string;
  emit: (ev: LocalEval, work: Work) => void;
  search?: Search;
}

export interface CevalEvent extends MessageEvent {
  data: { type: 'stop' };
}
