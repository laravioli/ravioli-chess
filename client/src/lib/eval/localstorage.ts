import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';

import { getRecommendedThreads } from './engine';

export class LocalEvalStorage {
  multipv = 1;
  searchms = 3000;
  threads: number = getRecommendedThreads();
  hashsize = 16;
  sri: string | undefined;
  disable?: number;

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: 'eval-storage',
      properties: ['multipv', 'searchms', 'threads', 'hashsize', 'sri', 'disable'],
      storage: window.localStorage,
    });
  }

  setMultiPv(nb: number) {
    this.multipv = nb;
  }

  setSearchMs(millis: number) {
    this.searchms = millis;
  }

  setThreads(nb: number) {
    this.threads = Math.max(1, Math.min(nb, 32));
  }

  setSri(sri: string) {
    this.sri = sri;
  }

  setDisable(nb: number) {
    this.disable = nb;
  }

  get isTab() {
    return this.sri == site.sri;
  }
}
