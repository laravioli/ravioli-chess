import { CevalState, toggle, throttle, clamp, povChances } from './util';
import { validateFen } from 'chess.js';
import { makeEngine, maxThreads } from './engine';
import { localStore } from 'src/stores';

const cevalDisabledSentinel = '1';

function enabledAfterDisable() {
  const enabledAfter = window.sessionStorage.getItem('ceval.enabled-after');
  const disable = localStore.getState().disable || cevalDisabledSentinel;
  return enabledAfter == disable;
}

//possible : does browser support engine
//allowed : does engine is allowed to run
//active : does engine is instanciate (worker)
//enabled : does the button enabled is on or off (mainly to handle tabs)

export class CevalCtrl {
  storedPv = () => localStore.getState().multipv;
  storedMovetime = () => localStore.getState().searchms;
  allowed = toggle(true);
  curEval = null;
  lastStarted = false;
  showEnginePrefs = toggle(false);

  constructor(opts) {
    this.init(opts);
  }

  setOpts(opts) {
    this.init({ ...this.opts, ...opts });
  }

  init(opts) {
    window.clienteval = this;
    this.opts = opts;
    this.possible = this.opts.possible;
    this.analysable = validateFen(this.opts.initialFen).ok;
    this.enabled = toggle(
      this.possible &&
        this.analysable &&
        this.allowed() &&
        enabledAfterDisable()
    );
  }

  onEmit = throttle(200, (ev, work) => {
    this.sortPvsInPlace(ev.pvs, work.ply % 2 ? 'white' : 'black');

    this.curEval = ev;
    this.opts.emit(ev);
    /*if (ev.fen !== this.lastEmitFen && enabledAfterDisable()) {
      // amnesty while auto disable not processed
      this.lastEmitFen = ev.fen;
      storage.fire('ceval.fen', ev.fen);
    }*/
  });

  doStart = (steps, gameId) => {
    if (!this.enabled() || !this.possible || !enabledAfterDisable()) return;
    const step = steps[steps.length - 1];

    localStore.setState({ sri: window.site.sri, disable: Math.random() });
    window.sessionStorage.setItem(
      'ceval.enabled-after',
      localStore.getState().disable
    );

    if (
      'movetime' in this.search.by &&
      (step.ceval?.millis ?? 0) >= this.search.by.movetime
    ) {
      this.lastStarted = { steps, gameId };
      return;
    }
    const work = {
      threads: this.threads,
      hashSize: this.hashSize,
      gameId,
      stopRequested: false,
      initialFen: steps[0].fen,
      moves: [],
      currentFen: step.fen,
      ply: step.ply,
      search: this.search.by,
      multiPv: this.search.multiPv,
      emit: (ev) => {
        if (!this.enabled()) return;
        this.onEmit(ev, work);
      },
    };

    // send fen after latest castling move and the following moves
    for (let i = 1; i < steps.length; i++) {
      const s = steps[i];
      work.moves.push(s.uci);
    }

    if (!this.worker) this.worker = makeEngine();

    this.worker.start(work);

    this.lastStarted = {
      steps,
      gameId,
    };
  };

  start = (steps, gameId) => {
    this.doStart(steps, gameId);
  };

  stop = () => {
    this.worker?.stop();
  };

  destroy = () => {
    this.worker?.destroy();
    this.worker = undefined;
  };

  get state() {
    return this.worker?.getState() ?? CevalState.Initial;
  }

  get search() {
    const s = {
      multiPv: this.storedPv(),
      by: {
        movetime: Math.min(this.storedMovetime(), Number.POSITIVE_INFINITY),
      },
    };
    if (this.isInfinite) s.by = { depth: 99 };
    return s;
  }

  get safeMovetime() {
    return Math.min(this.storedMovetime(), Number.POSITIVE_INFINITY);
  }

  get isInfinite() {
    return this.safeMovetime === Number.POSITIVE_INFINITY;
  }

  get isComputing() {
    return this.state === CevalState.Computing;
  }

  get threads() {
    const stored = localStore.getState().threads;
    return clamp(stored, {
      min: this.worker?.info.minThreads ?? 1,
      max: maxThreads(),
    });
  }

  get hashSize() {
    const stored = localStore.getState().hashsize;
    return Math.min(this.maxHash, stored ?? 16);
  }

  get maxHash() {
    return this.worker?.info.maxHash ?? 16;
  }

  toggle = () => {
    if (!this.possible || !this.allowed()) return;
    this.stop();
    if (!this.enabled() && !document.hidden) {
      const disable = localStore.getState().disable || cevalDisabledSentinel;
      if (disable)
        window.sessionStorage.setItem('ceval.enabled-after', disable);
      this.enabled(true);
    } else {
      window.sessionStorage.setItem('ceval.enabled-after', '');
      this.enabled(false);
    }
  };

  lastEmitFen = null;
  sortPvsInPlace = (pvs, color) =>
    pvs.sort((a, b) => povChances(color, b) - povChances(color, a));
}
