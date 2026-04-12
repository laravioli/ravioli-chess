//https://github.com/lichess-org/lila/blob/master/ui/lib/src/ceval/ctrl.ts
import { defaultPosition, setupPosition } from 'chessops/variant';
import { parseFen } from 'chessops/fen';
import { Result } from '@badrap/result';
import { observable, computed, action } from 'mobx';

import type { Path } from '@/lib/tree/interface';
import { throttle, clamp } from '@/lib/common';
import { EngineSettings, EngineState } from './localstorage';
import { getEngineInfo, makeEngine } from './engines';
import { engineSupported, maxThreads, povChances } from './utils';
import type {
  CevalEngine,
  CevalOpts,
  LocalEval,
  PvData,
  Search,
  Started,
  Step,
  Work,
  CevalEvent,
} from './interface';

export class Ceval {
  @observable private accessor analysable: boolean;
  @observable private accessor allowed: boolean;
  @observable.ref private accessor worker: CevalEngine | undefined;
  @observable.ref private accessor lastStarted: Started | false = false;
  private possible: boolean;

  private channel: BroadcastChannel | undefined;
  readonly settings: EngineSettings;
  readonly state: EngineState;
  opts: CevalOpts;

  constructor() {
    this.settings = new EngineSettings();
    this.state = new EngineState();
  }

  setOpts(opts: Partial<CevalOpts>) {
    this.init({ ...this.opts, ...opts });
  }

  init(opts: CevalOpts) {
    this.opts = opts;
    const pos = this.opts.initialFen
      ? parseFen(this.opts.initialFen).chain((setup) => setupPosition('chess', setup))
      : Result.ok(defaultPosition('chess'));
    this.possible = engineSupported(getEngineInfo(this.opts.id));
    this.analysable = pos.isOk;
    this.allowed = this.opts.allowed;
    this.opts.listening ? this.startListening() : this.stopListening();
  }

  @computed
  get isPaused(): boolean {
    return !this.worker && !!this.lastStarted;
  }

  @computed
  get isDisabled(): boolean {
    return !(this.possible && this.allowed && this.analysable);
  }

  @computed
  get isActive(): boolean {
    return !(this.isDisabled || this.isPaused) && this.state.active;
  }

  startListening() {
    if (this.channel) return;
    this.channel = new BroadcastChannel('ceval');
    this.channel.addEventListener('message', (event: CevalEvent) => {
      if (event.data['type'] === 'stop') this.destroy();
    });
  }

  stopListening() {
    this.channel?.close();
    this.channel = undefined;
  }

  sendTabMessage(msg: object) {
    this.channel?.postMessage(msg);
  }

  @action
  resume(work?: Work): void {
    try {
      this.worker ??= makeEngine(this.opts.id);
      if (work) this.worker.start(work);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  onEmit = throttle(200, (ev: LocalEval, work: Work) => {
    this.sortPvsInPlace(ev.pvs, work.ply % 2 === 0 ? 'white' : 'black');
    this.opts.emit(ev, work);
  });

  private readonly doStart = (s: Started) => {
    if (document.hidden) {
      this.lastStarted = s;
      return;
    }
    const step = s.steps[s.steps.length - 1];

    if ('movetime' in this.search.by && (step.ceval?.millis ?? 0) >= this.search.by.movetime) {
      this.lastStarted = s;
      return;
    }

    const work: Work = {
      threads: this.threads,
      hashSize: this.hashSize,
      gameId: s.gameId,
      stopRequested: false,
      initialFen: s.steps[0].fen,
      moves: [],
      currentFen: step.fen,
      path: s.path,
      ply: step.ply,
      search: this.search.by,
      multiPv: this.search.multiPv,
      emit: (ev: LocalEval) => this.onEmit(ev, work),
    };

    // send fen after latest castling move and the following moves
    for (let i = 1; i < s.steps.length; i++) {
      const si = s.steps[i];
      work.moves.push(si.uci!);
    }

    this.sendTabMessage({ type: 'stop' });

    this.resume(work);

    this.lastStarted = s;
  };

  start(path: Path, steps: Step[], gameId: string | undefined) {
    if (!this.allowed || this.isPaused) return;
    this.doStart({ path, steps, gameId });
  }

  stop() {
    this.worker?.stop();
  }

  @action
  destroy() {
    this.stop();
    this.worker?.destroy();
    this.worker = undefined;
  }

  get workerState() {
    return this.worker?.getState() ?? 'Initial';
  }

  get search() {
    const s = {
      multiPv: this.settings.multipv,
      by: {
        movetime: Math.min(this.settings.searchms, Number.POSITIVE_INFINITY),
      },
    } as Search;
    if (this.isInfinite) s.by = { depth: 99 };
    return s;
  }

  get safeMovetime() {
    return Math.min(this.settings.searchms, Number.POSITIVE_INFINITY);
  }

  get isInfinite() {
    return this.safeMovetime === Number.POSITIVE_INFINITY;
  }

  get isComputing() {
    return this.workerState === 'Computing';
  }

  get threads() {
    const stored = this.settings.threads;
    const info = this.worker?.getInfo();
    return clamp(stored, {
      min: info?.minThreads ?? 1,
      max: maxThreads(info),
    });
  }

  get hashSize() {
    const stored = this.settings.hashsize;
    return Math.min(this.maxHash, stored ?? 16);
  }

  get maxHash() {
    return this.worker?.getInfo().maxHash ?? 16;
  }

  lastEmitFen = null;
  sortPvsInPlace = (pvs: PvData[], color: Color) =>
    pvs.sort((a, b) => povChances(color, b) - povChances(color, a));
}
