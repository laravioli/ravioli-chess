import { CevalState, toggle, throttle, clamp, povChances } from './util';
import { validateFen } from 'chess.js';
import { makeEngine, maxThreads } from './engine';
import { useEvalStore } from '../../stores/hooks/usepersiststore';
/*TYPESCRIPT TYPE
type WinningChances = number;
type SearchBy =
  | { movetime: number }
  | { depth: number }
  | { nodes: number };
type Search = { by: SearchBy; multiPv: number; indeterminate?: boolean };

type interface Work {
  variant: VariantKey;
  threads: number;
  hashSize: number | undefined;
  gameId: string | undefined; // send ucinewgame when changed
  stopRequested: boolean;

  path: string;
  search: SearchBy;
  multiPv: number;
  ply: number;
  threatMode: boolean;
  initialFen: string;
  currentFen: string;
  moves: string[];
  emit: (ev: Tree.LocalEval) => void;
  }

  interface CevalOpts {
    possible: boolean; => zustand possible(getter)
    initialFen: string | undefined; => zustand get fen()
    emit: (ev: Tree.LocalEval, meta: EvalMeta) => void;
    search?: Search;
  }
*/
//
//Code

/*const cevalDisabledSentinel = '1';

function enabledAfterDisable() {
  const enabledAfter = tempStorage.get('ceval.enabled-after');
  const disable = storage.get('ceval.disable') || cevalDisabledSentinel;
  return enabledAfter === disable;
}*/

//possible : does browser support engine
//allowed : does engine is allowed to run
//active : does engine is instanciate (worker)
//enabled : does the button enabled is on or off (mainly to handle tabs)

//todo add tabs handling with session storage and toggle
export class CevalCtrl {
  storedPv = () => useEvalStore.getState().multipv;
  storedMovetime = () => useEvalStore.getState().searchms;
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
    this.opts = opts;
    this.possible = this.opts.possible;
    this.analysable = validateFen(this.opts.initialFen).ok;
    this.enabled = toggle(
      this.possible && this.analysable && this.allowed() && false
    ); //+tabs);
  }

  onEmit = throttle(200, (ev, work) => {
    this.sortPvsInPlace(ev.pvs, work.ply % 2 ? 'white' : 'black');

    this.curEval = ev;
    this.opts.emit(ev); //this is where i use ev to set ui => see note*
    /*if (ev.fen !== this.lastEmitFen && enabledAfterDisable()) {
      // amnesty while auto disable not processed
      this.lastEmitFen = ev.fen;
      storage.fire('ceval.fen', ev.fen);
    }*/
  });

  //create a game with game id(undefined for analyse) and initial fen, attach history to it
  //with a path(point to a stack, and step => the tab)
  //path could be usefull with on emit(save analyse on right node)

  doStart = (steps, gameId) => {
    if (!this.enabled() || !this.possible /*|| !enabledAfterDisable()*/) return;
    const step = steps[steps.length - 1];
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

    // Notify all other tabs to disable ceval.
    /*storage.fire('ceval.disable');
      tempStorage.set('ceval.enabled-after', storage.get('ceval.disable')!);*/

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
    const stored = useEvalStore.getState().threads;
    return clamp(stored, {
      min: this.worker?.info.minThreads ?? 1,
      max: maxThreads(),
    });
  }

  get hashSize() {
    const stored = useEvalStore.getState().hashsize;
    return Math.min(this.maxHash, stored ?? 16);
  }

  get maxHash() {
    return this.worker?.info.maxHash ?? 16;
  }

  toggle = () => {
    if (!this.possible || !this.allowed()) return;
    this.stop();
    if (!this.enabled()) {
      this.enabled(true);
    } else {
      this.enabled(false);
    }
    /*if (!this.enabled() && !document.hidden) {
      const disable = storage.get('ceval.disable') || cevalDisabledSentinel;
      if (disable) tempStorage.set('ceval.enabled-after', disable);
      this.enabled(true);
    } else {
      tempStorage.set('ceval.enabled-after', '');
      this.enabled(false);
      this.download = undefined;
    }*/
  };

  lastEmitFen = null;
  sortPvsInPlace = (pvs, color) =>
    pvs.sort((a, b) => povChances(color, b) - povChances(color, a));
}
