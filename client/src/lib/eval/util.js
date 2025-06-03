/*----------------*/
/*-----ENGINE-----*/
/*----------------*/

export const CevalState = Object.freeze({
  Initial: Symbol('Initial'),
  Loading: Symbol('Loading'),
  Idle: Symbol('Idle'),
  Computing: Symbol('Computing'),
  Failed: Symbol('Failed'),
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
  console.log('sharedtest', typeof Atomics !== 'object');
  console.log('sharedtest', typeof SharedArrayBuffer !== 'function');

  if (typeof Atomics !== 'object') return false;
  if (typeof SharedArrayBuffer !== 'function') return false;

  let mem;
  try {
    mem = new WebAssembly.Memory({ shared: true, initial: 1, maximum: 2 });
    console.log('sharedtest', !(mem.buffer instanceof SharedArrayBuffer));

    if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

    window.postMessage(mem.buffer, '*');
  } catch {
    return false;
  }
  console.log('sharedtest', mem.buffer instanceof SharedArrayBuffer);
  return mem.buffer instanceof SharedArrayBuffer;
}

export const browserSupport = memoize(() => {
  const features = [];
  if (
    typeof WebAssembly === 'object' &&
    typeof WebAssembly.validate === 'function' &&
    WebAssembly.validate(Uint8Array.from([0, 97, 115, 109, 1, 0, 0, 0]))
  ) {
    features.push('wasm');
    // i32x4.dot_i16x8_s, i32x4.trunc_sat_f64x2_u_zero
    const sourceWithSimd = Uint8Array.from([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 12, 2, 96, 2, 123, 123, 1, 123, 96, 1,
      123, 1, 123, 3, 3, 2, 0, 1, 7, 9, 2, 1, 97, 0, 0, 1, 98, 0, 1, 10, 19, 2,
      9, 0, 32, 0, 32, 1, 253, 186, 1, 11, 7, 0, 32, 0, 253, 253, 1, 11,
    ]);
    if (WebAssembly.validate(sourceWithSimd)) features.push('simd');
    if (sharedMemoryTest()) features.push('sharedMem');
  }
  try {
    new Worker(
      URL.createObjectURL(
        new Blob(["import('data:text/javascript,export default {}')"], {
          type: 'application/javascript',
        })
      )
    ).terminate();
    features.push('dynamicImportFromWorker');
  } catch (error) {
    console.error('Worker creation failed:', error);
  }

  console.log(features);
  return Object.freeze(features);
});

/*----------------*/
/*---CONTROLLER---*/
/*----------------*/

const defined = (value) => value !== undefined;

export const prop = (initialValue) => {
  let value = initialValue;
  return (v) => {
    if (defined(v)) value = v;
    return value;
  };
};

const propWithEffect = (initialValue, effect) => {
  let value = initialValue;
  return (v) => {
    if (defined(v)) {
      value = v;
      effect(v);
    }
    return value;
  };
};

export const toggle = (initialValue, effect = () => {}) => {
  const prop = propWithEffect(initialValue, effect);
  prop.toggle = () => prop(!prop());
  prop.effect = effect;
  return prop;
};

export function clamp(value, bounds) {
  return Math.max(
    bounds.min ?? -Infinity,
    Math.min(value, bounds.max ?? Infinity)
  );
}

/**
 * Ensures calls to the wrapped function are spaced by the given delay.
 * Any extra calls are dropped, except the last one, which waits for the delay.
 */
export function throttle(delay, wrapped) {
  return throttlePromise(function (...args) {
    wrapped.apply(this, args);
    return new Promise((resolve) => setTimeout(resolve, delay));
  });
}

/***
 * Wraps an asynchronous function to ensure only one call at a time is in
 * flight. Any extra calls are dropped, except the last one, which waits for
 * the previous call to complete.
 */
function throttlePromiseWithResult(wrapped) {
  let current;
  let pending;

  return function (...args) {
    const runCurrent = () => {
      current = wrapped.apply(this, args).finally(() => {
        current = undefined;
        if (pending) {
          pending.run();
          pending = undefined;
        }
      });
      return current;
    };

    if (!current) return runCurrent();

    pending?.reject();
    const next = new Promise((resolve, reject) => {
      pending = {
        run: () =>
          runCurrent().then(
            (res) => {
              resolve(res);
              return res;
            },
            (err) => {
              reject(err);
              throw err;
            }
          ),
        reject: () => reject(new Error('Throttled')),
      };
    });
    return next;
  };
}

/* doesn't fail the promise if it's throttled */
function throttlePromise(wrapped) {
  const throttler = throttlePromiseWithResult(wrapped);
  return function (...args) {
    return throttler.apply(this, args).catch(() => {});
  };
}

/*----------------*/
/*-----THREADS----*/
/*----------------*/

const isMobile = () => isAndroid() || isIos();

export const fewerCores = memoize(
  () => isMobile() || navigator.userAgent.includes('CrOS')
);

/*----------------*/
/*------STAT------*/
/*----------------*/

const toPov = (color, diff) => (color === 'white' ? diff : -diff);

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
  typeof ev.mate !== 'undefined'
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

export const sortPvsInPlace = (pvs, color) =>
  pvs.sort((a, b) => povChances(color, b) - povChances(color, a));

/*----------------*/
/*-----ANALYSE----*/
/*----------------*/

export function isEvalBetter(a, b) {
  return a.depth > b.depth || (a.depth === b.depth && a.nodes > b.nodes);
}

export function renderEval(e) {
  e = Math.max(Math.min(Math.round(e / 10) / 10, 99), -99);
  return (e > 0 ? '+' : '') + e.toFixed(1);
}
