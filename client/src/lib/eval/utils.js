/*----------------*/
/*-----ENGINE-----*/
/*----------------*/

export const CevalState = Object.freeze({
  Initial: Symbol("Initial"),
  Loading: Symbol("Loading"),
  Idle: Symbol("Idle"),
  Computing: Symbol("Computing"),
  Failed: Symbol("Failed"),
});

export const sharedWasmMemory = (lo, hi = 32767) => {
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

const memoize = (compute) => {
  let computed;
  return () => {
    if (computed === undefined) computed = compute();
    return computed;
  };
};

const isAndroid = memoize(() => /Android/.test(navigator.userAgent));

const isIos = memoize(
  () => /iPhone|iPod/.test(navigator.userAgent) || isIPad()
);

const isIPad = () =>
  navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(navigator.userAgent);

function maxHashMB() {
  if (isAndroid()) return 64; // budget androids are easy to crash @ 128
  else if (isIPad())
    return 64; // iPadOS safari pretends to be desktop but acts more like iphone
  else if (isIos()) return 32;
  return 512; // allocating 1024 often fails and offers little benefit over 512, or 16 for that matter
}
export const maxHash = maxHashMB();

function sharedMemoryTest() {
  if (typeof Atomics !== "object") return false;
  if (typeof SharedArrayBuffer !== "function") return false;

  let mem;
  try {
    mem = new WebAssembly.Memory({ shared: true, initial: 1, maximum: 2 });

    if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

    window.postMessage(mem.buffer, "*");
  } catch {
    return false;
  }
  return mem.buffer instanceof SharedArrayBuffer;
}

export const browserSupport = memoize(() => {
  const features = [];
  if (
    typeof WebAssembly === "object" &&
    typeof WebAssembly.validate === "function" &&
    WebAssembly.validate(Uint8Array.from([0, 97, 115, 109, 1, 0, 0, 0]))
  ) {
    features.push("wasm");
    // i32x4.dot_i16x8_s, i32x4.trunc_sat_f64x2_u_zero
    const sourceWithSimd = Uint8Array.from([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 12, 2, 96, 2, 123, 123, 1, 123, 96, 1,
      123, 1, 123, 3, 3, 2, 0, 1, 7, 9, 2, 1, 97, 0, 0, 1, 98, 0, 1, 10, 19, 2,
      9, 0, 32, 0, 32, 1, 253, 186, 1, 11, 7, 0, 32, 0, 253, 253, 1, 11,
    ]);
    if (WebAssembly.validate(sourceWithSimd)) features.push("simd");
    if (sharedMemoryTest()) features.push("sharedMem");
  }
  try {
    new Worker(
      URL.createObjectURL(
        new Blob(["import('data:text/javascript,export default {}')"], {
          type: "application/javascript",
        })
      )
    ).terminate();
    features.push("dynamicImportFromWorker");
  } catch (error) {
    console.error("Worker creation failed:", error);
  }

  return Object.freeze(features);
});

/*----------------*/
/*-----THREADS----*/
/*----------------*/

const isMobile = () => isAndroid() || isIos();

export const fewerCores = memoize(
  () => isMobile() || navigator.userAgent.includes("CrOS")
);

/*----------------*/
/*------STAT------*/
/*https://github.com/lichess-org/lila/blob/master/ui/lib/src/ceval/winningChances.ts
 */

const toPov = (color, diff) => (color === "white" ? diff : -diff);

const rawWinningChances = (cp) => {
  const MULTIPLIER = -0.00368208;
  return 2 / (1 + Math.exp(MULTIPLIER * cp)) - 1;
};

const cpWinningChances = (cp) =>
  rawWinningChances(Math.min(Math.max(-1000, cp), 1000));

const mateWinningChances = (mate) => {
  const cp = (21 - Math.min(10, Math.abs(mate))) * 100;
  const signed = cp * (mate > 0 ? 1 : -1);
  return rawWinningChances(signed);
};

const evalWinningChances = (ev) =>
  typeof ev.mate !== "undefined"
    ? mateWinningChances(ev.mate)
    : cpWinningChances(ev.cp);

// winning chances for a color
// 1  infinitely winning
// -1 infinitely losing
export const povChances = (color, ev) => toPov(color, evalWinningChances(ev));

// computes the difference, in winning chances, between two evaluations
// 1  = e1 is infinitely better than e2
// -1 = e1 is infinitely worse  than e2
export const povDiff = (color, e1, e2) =>
  (povChances(color, e1) - povChances(color, e2)) / 2;

/*----------------*/
/*-----ANALYSE----*/
/*----------------*/

export function isEvalBetter(a, b) {
  return a.depth > b.depth || (a.depth === b.depth && a.nodes > b.nodes);
}

export const getEval = (evaluation) => {
  if (evaluation) {
    if (evaluation.mate) {
      return "#" + evaluation.mate;
    } else {
      return renderEval(evaluation.cp);
    }
  }
};

function renderEval(e) {
  e = Math.max(Math.min(Math.round(e / 10) / 10, 99), -99);
  return (e > 0 ? "+" : "") + e.toFixed(1);
}
