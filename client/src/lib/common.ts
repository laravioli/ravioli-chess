//https://github.com/lichess-org/lila/blob/master/ui/lib/src/common.ts

export const defined = <T>(value: T | undefined): value is T => value !== undefined;

export interface Prop<T> {
  (): T;
  (v: T): T;
}
export interface PropWithEffect<T> extends Prop<T> {}

export const prop = <A>(initialValue: A): Prop<A> => {
  let value = initialValue;
  return (v?: A) => {
    if (defined(v)) value = v;
    return value;
  };
};

export const propWithEffect = <A>(initialValue: A, effect: (value: A) => void): PropWithEffect<A> => {
  let value = initialValue;
  return (v?: A) => {
    if (defined(v)) {
      value = v;
      effect(v);
    }
    return value;
  };
};

export interface Toggle extends PropWithEffect<boolean> {
  toggle(): void;
  effect(value: boolean): void;
}

export const toggle = (initialValue: boolean, effect: (value: boolean) => void = () => {}): Toggle => {
  const prop = propWithEffect<boolean>(initialValue, effect) as Toggle;
  prop.toggle = () => prop(!prop());
  prop.effect = effect;
  return prop;
};

export function clamp(value, bounds) {
  return Math.max(bounds.min ?? -Infinity, Math.min(value, bounds.max ?? Infinity));
}

/**
 * Ensures calls to the wrapped function are spaced by the given delay.
 * Any extra calls are dropped, except the last one, which waits for the delay.
 */
export function throttle<T extends (...args: any) => void>(
  delay: number,
  wrapped: T,
): (...args: Parameters<T>) => void {
  return throttlePromise(function (this: any, ...args: Parameters<T>) {
    wrapped.apply(this, args);
    return new Promise(resolve => setTimeout(resolve, delay));
  });
}

/***
 * Wraps an asynchronous function to ensure only one call at a time is in
 * flight. Any extra calls are dropped, except the last one, which waits for
 * the previous call to complete.
 */
function throttlePromiseWithResult<R, T extends (...args: any) => Promise<R>>(
  wrapped: T,
): (...args: Parameters<T>) => Promise<R> {
  let current: Promise<R> | undefined;
  let pending:
    | {
        run: () => Promise<R>;
        reject: () => void;
      }
    | undefined;

  return function (this: any, ...args: Parameters<T>): Promise<R> {
    const self = this;

    const runCurrent = () => {
      current = wrapped.apply(self, args).finally(() => {
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
    const next = new Promise<R>((resolve, reject) => {
      pending = {
        run: () =>
          runCurrent().then(
            res => {
              resolve(res);
              return res;
            },
            err => {
              reject(err);
              throw err;
            },
          ),
        reject: () => reject(new Error('Throttled')),
      };
    });
    return next;
  };
}

/* doesn't fail the promise if it's throttled */
function throttlePromise<T extends (...args: any) => Promise<void>>(
  wrapped: T,
): (...args: Parameters<T>) => Promise<void> {
  const throttler = throttlePromiseWithResult<void, T>(wrapped);
  return function (this: any, ...args: Parameters<T>): Promise<void> {
    return throttler.apply(this, args).catch(() => {});
  };
}

export function debounce<T extends (...args: any) => void>(
  f: T,
  wait: number,
  immediate = false,
): (...args: Parameters<T>) => void {
  let timeout: Timeout | undefined;
  let lastBounce = 0;

  return function (this: any, ...args: Parameters<T>) {
    const self = this;

    if (timeout) clearTimeout(timeout);
    timeout = undefined;

    const elapsed = performance.now() - lastBounce;
    lastBounce = performance.now();
    if (immediate && elapsed > wait) f.apply(self, args);
    else
      timeout = setTimeout(() => {
        timeout = undefined;
        f.apply(self, args);
      }, wait);
  };
}
