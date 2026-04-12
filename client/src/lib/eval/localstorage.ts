import { observable, action } from 'mobx';
import { persist } from '@/core/store/utils';

@persist('engine.settings', ['multipv', 'searchms', 'threads', 'hashsize'], { sync: true })
export class EngineSettings {
  @observable accessor multipv = 1;
  @observable accessor searchms = 3000;
  @observable accessor threads: number = 7; //todo: replace with getRecommendedThreads
  @observable accessor hashsize = 16;

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
