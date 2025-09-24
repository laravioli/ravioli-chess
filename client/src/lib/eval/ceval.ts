//https://github.com/lichess-org/lila/blob/master/ui/lib/src/ceval/ctrl.ts
import { makeEngine, maxThreads, engineSupported, StockfishWebEngine } from './engine';
import { CevalState, povChances } from './utils';
import { type Toggle, toggle, throttle, clamp } from '../common';
import { parseFen } from 'chessops/fen';
import { observable, action, runInAction } from 'mobx';
import { defaultPosition, setupPosition } from 'chessops/variant';
import { Result } from '@badrap/result';
import type { LocalEvalStorage } from './localstorage';
import type { CevalOpts, LocalEval, PvData, Search, Started, Step, Work } from './interface';
import type { Path } from '../tree/interface';

const cevalDisabledSentinel = '1';

const enabledAfterDisable = action((ceval: Ceval) => {
  const enabledAfter = window.sessionStorage.getItem('ceval.enabled-after');
  const disable = ceval.evalStorage.disable || cevalDisabledSentinel;
  return enabledAfter == disable;
});

export class Ceval {
  opts: CevalOpts;
  possible: boolean;
  analysable: boolean;
  allowed: Toggle;
  @observable accessor enabled: boolean;

  lastStarted: Started | false = false;
  evalStorage: LocalEvalStorage;

  private worker: StockfishWebEngine | undefined;

  constructor(evalStorage: LocalEvalStorage) {
    this.evalStorage = evalStorage;
    this.possible = engineSupported();
  }

  setOpts(opts: Partial<CevalOpts>) {
    this.init({ ...this.opts, ...opts });
  }

  init(opts: CevalOpts) {
    this.opts = opts;
    const pos = this.opts.initialFen
      ? parseFen(this.opts.initialFen).chain(setup => setupPosition('chess', setup))
      : Result.ok(defaultPosition('chess'));
    this.analysable = pos.isOk;
    this.allowed = toggle(this.opts.allowed);
    this.enabled = this.possible && this.analysable && this.allowed() && enabledAfterDisable(this);
  }

  onEmit = throttle(200, (ev: LocalEval, work: Work) => {
    this.sortPvsInPlace(ev.pvs, work.ply % 2 === 0 ? 'white' : 'black');
    this.opts.emit(ev, work);
  });

  doStart(path: Path, steps: Step[], gameId: string | undefined) {
    if (!this.enabled || !this.possible || !enabledAfterDisable(this)) return;
    const step = steps[steps.length - 1];

    runInAction(() => {
      this.evalStorage.setSri(window.site.sri);
      this.evalStorage.setDisable(Math.random());
    });

    window.sessionStorage.setItem('ceval.enabled-after', this.evalStorage.disable!.toString());

    if ('movetime' in this.search.by && (step.ceval?.millis ?? 0) >= this.search.by.movetime) {
      this.lastStarted = { path, steps, gameId };
      return;
    }

    const work: Work = {
      threads: this.threads,
      hashSize: this.hashSize,
      gameId,
      stopRequested: false,
      initialFen: steps[0].fen,
      moves: [],
      currentFen: step.fen,
      path,
      ply: step.ply,
      search: this.search.by,
      multiPv: this.search.multiPv,
      emit: (ev: LocalEval) => {
        if (!this.enabled) return;
        this.onEmit(ev, work);
      },
    };

    // send fen after latest castling move and the following moves
    for (let i = 1; i < steps.length; i++) {
      const s = steps[i];
      work.moves.push(s.uci!);
    }

    if (!this.worker) this.worker = makeEngine();

    this.worker.start(work);

    this.lastStarted = {
      path,
      steps,
      gameId,
    };
  }

  start(path: Path, steps: Step[], gameId: string | undefined) {
    this.doStart(path, steps, gameId);
  }

  stop() {
    this.worker?.stop();
  }

  destroy() {
    this.worker?.destroy();
    this.worker = undefined;
  }

  get state() {
    return this.worker?.getState() ?? CevalState.Initial;
  }

  get search() {
    const s = {
      multiPv: this.evalStorage.multipv,
      by: {
        movetime: Math.min(this.evalStorage.searchms, Number.POSITIVE_INFINITY),
      },
    } as Search;
    if (this.isInfinite) s.by = { depth: 99 };
    return s;
  }

  get safeMovetime() {
    return Math.min(this.evalStorage.searchms, Number.POSITIVE_INFINITY);
  }

  get isInfinite() {
    return this.safeMovetime === Number.POSITIVE_INFINITY;
  }

  get isComputing() {
    return this.state === CevalState.Computing;
  }

  get threads() {
    const stored = this.evalStorage.threads;
    return clamp(stored, {
      min: this.worker?.info.minThreads ?? 1,
      max: maxThreads(),
    });
  }

  get hashSize() {
    const stored = this.evalStorage.hashsize;
    return Math.min(this.maxHash, stored ?? 16);
  }

  get maxHash() {
    return this.worker?.info.maxHash ?? 16;
  }

  toggle() {
    if (!this.possible || !this.allowed()) return;
    this.stop();
    if (!this.enabled && !document.hidden) {
      const disable = this.evalStorage.disable || cevalDisabledSentinel;
      if (disable) window.sessionStorage.setItem('ceval.enabled-after', disable.toString());
      this.enabled = true;
    } else {
      window.sessionStorage.setItem('ceval.enabled-after', '');
      this.enabled = false;
    }
  }

  lastEmitFen = null;
  sortPvsInPlace = (pvs: PvData[], color: Color) =>
    pvs.sort((a, b) => povChances(color, b) - povChances(color, a));
}
