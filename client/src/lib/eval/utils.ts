/*----------------*/
/*-----ENGINE-----*/
/*----------------*/

import type {
  Feature,
  EvalScore,
  WinningChances,
  ClientEval,
  BrowserEngineInfo,
} from './interface';

export const sharedWasmMemory = (lo: number, hi = 32767): WebAssembly.Memory => {
  let shrink = 4; // 32767 -> 24576 -> 16384 -> 12288 -> 8192 -> 6144 -> etc
  while (true) {
    try {
      return new WebAssembly.Memory({ shared: true, initial: lo, maximum: hi });
    } catch (e) {
      if (hi <= lo || !(e instanceof RangeError)) throw e;
      hi = Math.max(lo, Math.ceil(hi - hi / shrink));
      shrink = shrink === 4 ? 3 : 4;
    }
  }
};

const memoize = <A>(compute: () => A): (() => A) => {
  let computed: A;
  return () => {
    if (computed === undefined) computed = compute();
    return computed;
  };
};

const isAndroid = memoize(() => /Android/.test(navigator.userAgent));

const isIos = memoize(() => /iPhone|iPod/.test(navigator.userAgent) || isIPad());

const isIPad = () => navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(navigator.userAgent);

function maxHashMB() {
  if (isAndroid())
    return 64; // budget androids are easy to crash @ 128
  else if (isIPad())
    return 64; // iPadOS safari pretends to be desktop but acts more like iphone
  else if (isIos()) return 32;
  return 512; // allocating 1024 often fails and offers little benefit over 512, or 16 for that matter
}
export const maxHash = maxHashMB();

const lowerAgent = navigator.userAgent.toLowerCase();

function sharedMemoryTest(): boolean {
  // Avoid WebKit crash: https://bugs.webkit.org/show_bug.cgi?id=303387
  if (lowerAgent.includes('version/26.2')) return false;

  if (typeof Atomics !== 'object' || typeof SharedArrayBuffer !== 'function') return false;

  let mem;
  try {
    mem = new WebAssembly.Memory({ shared: true, initial: 1, maximum: 2 });
    if (!(mem.buffer instanceof SharedArrayBuffer)) return false;
    window.postMessage(mem.buffer, '*');
    return true;
  } catch {
    return false;
  }
}
export const features: () => readonly Feature[] = memoize<readonly Feature[]>(() => {
  const features: Feature[] = [];
  if (typeof BigInt === 'function') features.push('bigint');
  if (typeof structuredClone !== 'undefined') features.push('structuredClone');
  if (
    typeof WebAssembly === 'object' &&
    typeof WebAssembly.validate === 'function' &&
    WebAssembly.validate(Uint8Array.from([0, 97, 115, 109, 1, 0, 0, 0]))
  ) {
    features.push('wasm');
    // i32x4.dot_i16x8_s, i32x4.trunc_sat_f64x2_u_zero
    const sourceWithSimd = Uint8Array.from([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 12, 2, 96, 2, 123, 123, 1, 123, 96, 1, 123, 1, 123, 3, 3, 2,
      0, 1, 7, 9, 2, 1, 97, 0, 0, 1, 98, 0, 1, 10, 19, 2, 9, 0, 32, 0, 32, 1, 253, 186, 1, 11, 7, 0,
      32, 0, 253, 253, 1, 11,
    ]);
    if (WebAssembly.validate(sourceWithSimd)) features.push('simd');
    // i32x4.dot_i8x16_i7x16_add_s
    const sourceWithRelaxedSimd = Uint8Array.from([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 8, 1, 96, 3, 123, 123, 123, 1, 123, 3, 2, 1, 0, 7, 5, 1, 1,
      99, 0, 0, 10, 13, 1, 11, 0, 32, 0, 32, 1, 32, 2, 253, 147, 2, 11,
    ]);
    if (WebAssembly.validate(sourceWithRelaxedSimd)) features.push('relaxedSimd');
    if (sharedMemoryTest()) features.push('sharedMem');
  }
  try {
    new Worker(
      URL.createObjectURL(
        new Blob(["import('data:text/javascript,export default {}')"], {
          type: 'application/javascript',
        }),
      ),
    ).terminate();
    features.push('dynamicImportFromWorker');
  } catch {}
  return Object.freeze(features);
});

export const engineSupported = (info: BrowserEngineInfo) =>
  info.requires.every((req) => features().includes(req));

/*----------------*/
/*-----THREADS----*/
/*----------------*/

export const maxThreads = (info: BrowserEngineInfo | undefined) => {
  return fewerCores()
    ? Math.min(info?.maxThreads ?? 32, navigator.hardwareConcurrency)
    : (info?.maxThreads ?? 32);
};
const isMobile = () => isAndroid() || isIos();

export const fewerCores = memoize(() => isMobile() || navigator.userAgent.includes('CrOS'));

/*----------------*/
/*------STAT------*/
/*https://github.com/lichess-org/lila/blob/master/ui/lib/src/ceval/winningChances.ts
 */

const toPov = (color: Color, diff: number) => (color === 'white' ? diff : -diff);

const rawWinningChances = (cp: number) => {
  const MULTIPLIER = -0.00368208;
  return 2 / (1 + Math.exp(MULTIPLIER * cp)) - 1;
};

const cpWinningChances = (cp: number) => rawWinningChances(Math.min(Math.max(-1000, cp), 1000));

const mateWinningChances = (mate: number) => {
  const cp = (21 - Math.min(10, Math.abs(mate))) * 100;
  const signed = cp * (mate > 0 ? 1 : -1);
  return rawWinningChances(signed);
};

const evalWinningChances = (ev: EvalScore): WinningChances =>
  typeof ev.mate !== 'undefined' ? mateWinningChances(ev.mate) : cpWinningChances(ev.cp!);

// winning chances for a color
// 1  infinitely winning
// -1 infinitely losing
export const povChances = (color: Color, ev: EvalScore) => toPov(color, evalWinningChances(ev));

// computes the difference, in winning chances, between two evaluations
// 1  = e1 is infinitely better than e2
// -1 = e1 is infinitely worse  than e2
export const povDiff = (color: Color, e1: EvalScore, e2: EvalScore) =>
  (povChances(color, e1) - povChances(color, e2)) / 2;

/*----------------*/
/*-----ANALYSE----*/
/*----------------*/

export function isEvalBetter(a: ClientEval, b: ClientEval) {
  return a.depth > b.depth || (a.depth === b.depth && a.nodes > b.nodes);
}

export const getEval = (evaluation: EvalScore) => {
  if (evaluation.mate) {
    return '#' + evaluation.mate;
  } else if (evaluation.cp) {
    return renderEval(evaluation.cp);
  } else return '';
};

function renderEval(e: number) {
  e = Math.max(Math.min(Math.round(e / 10) / 10, 99), -99);
  return (e > 0 ? '+' : '') + e.toFixed(1);
}
