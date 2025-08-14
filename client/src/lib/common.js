export const defined = (value) => value !== undefined;

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
        reject: () => reject(new Error("Throttled")),
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
