import { observable, action } from 'mobx';
import { persist } from '@/core/store/utils';
import { BrowserEngineInfo } from './interface';
import { getRecommendedThreads } from './engines';

interface SettingsOpts {
  possible: boolean;
  info: BrowserEngineInfo | undefined;
}

@persist('engine.settings', ['multipv', 'searchms', 'threads', 'hashsize'], { sync: true })
export class EngineSettings {
  @observable accessor multipv = 1;
  @observable accessor searchms = 3000;
  @observable accessor threads: number;
  @observable accessor hashsize = 16;

  constructor(opts: SettingsOpts) {
    this.threads = opts.possible ? getRecommendedThreads(opts.info!) : 2;
  }

  @action
  setMultiPv(nb: number) {
    this.multipv = nb;
  }

  @action
  setSearchMs(millis: number) {
    this.searchms = millis;
  }

  @action
  setThreads(nb: number) {
    this.threads = Math.max(1, Math.min(nb, 32));
  }
}

@persist('engine.state', ['active'])
export class EngineState {
  @observable accessor active: boolean = false;

  @action
  setActive(active: boolean) {
    this.active = active;
  }
}
