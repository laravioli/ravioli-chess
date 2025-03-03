import {
  CevalState,
  toggle,
  throttle,
  clamp,
  fewerCores,
  povChances,
} from './util';
import { makeEngine } from './engine';

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

export class CevalCtrl {
  //zustand
  storedPv = () => 2; //getter
  storedMovetime = () => 8000; //getter
  //once the code works, change allowed, active, enabled, etc logic (edit, game, analyse)
  allowed = toggle(true); //probably useless in my case (maybe editor vs analyse)
  active = toggle(true); //zustand state=> destroy or create (setter)
  pvBoard = () => null; //setter

  curEval = null;
  lastStarted = false;
  showEnginePrefs = toggle(false); //getter

  constructor(opts) {
    this.init(opts);
  }

  setOpts(opts) {
    this.init({ ...this.opts, ...opts });
  }

  init(opts) {
    this.opts = opts;
    this.possible = this.opts.possible; //boolean :does wasm is supported ;
    this.analysable = true; //is legal fen
    this.enabled = toggle(this.possible && this.analysable && this.allowed()); //+tabs);
    if (!this.active()) {
      this.worker?.destroy();
      this.worker = undefined;
    }
  }

  onEmit = throttle(200, (ev, work) => {
    this.sortPvsInPlace(ev.pvs, work.ply % 2 ? 'white' : 'black');

    this.curEval = ev;
    this.opts.emit(ev, work); //this is where i use ev to set ui => see note*
    /*if (ev.fen !== this.lastEmitFen && enabledAfterDisable()) {
      // amnesty while auto disable not processed
      this.lastEmitFen = ev.fen;
      storage.fire('ceval.fen', ev.fen);
    }*/
  });

  //create a game with game id(undefined for analyse) and initial fen, attach history to it
  //with a path(point to a stack, and step => the tab)
  //path could be usefull with on emit(save analyse on right node)

  doStart = (path, steps, gameId) => {
    if (!this.enabled() || !this.possible /*|| !enabledAfterDisable()*/) return;
    const step = steps[steps.length - 1];
    if (
      'movetime' in this.search.by &&
      (step.ceval?.millis ?? 0) >= this.search.by.movetime
    ) {
      this.lastStarted = { path, steps, gameId };
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
      path,
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
      path,
      steps,
      gameId,
    };
  };

  start = (path, steps, gameId) => {
    console.log(this.worker);
    this.doStart(path, steps, gameId);
  };

  stop = () => {
    this.worker?.stop();
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

  setThreads = (threads) => {
    //zustand(rewrite)
    console.log(threads);
  };

  get threads() {
    const stored = undefined; //zustand(getter)
    const desired = stored ? parseInt(stored) : this.recommendedThreads;
    return clamp(desired, {
      min: this.worker?.minThreads ?? 1,
      max: this.maxThreads,
    });
  }

  get recommendedThreads() {
    return clamp(
      navigator.hardwareConcurrency -
        (navigator.hardwareConcurrency % 2 ? 0 : 1),
      {
        min: this.worker?.minThreads ?? 1,
        max: this.maxThreads,
      }
    );
  }

  get maxThreads() {
    return fewerCores()
      ? Math.min(this.worker?.maxThreads ?? 32, navigator.hardwareConcurrency)
      : this.worker?.maxThreads ?? 32;
  }

  setHashSize = (hash) => console.log(hash); //zustand setter;

  get hashSize() {
    const stored = undefined;
    return Math.min(this.maxHash, stored ? parseInt(stored, 10) : 16);
  }

  get maxHash() {
    return this.worker?.maxHash ?? 16;
  }

  setPvBoard = (pvBoard) => {
    //zustand setter, dont really need this function since pvBoard will be sufficient
    this.pvBoard(pvBoard);
  };

  toggle = () => {
    if (!this.possible || !this.allowed()) return;
    this.stop();
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
