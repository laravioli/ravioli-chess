import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { getRecommendedThreads } from './engine';

export class LocalEvalStorage {
  multipv = 1;
  searchms = 3000;
  threads = getRecommendedThreads();
  hashsize = 16;
  sri = undefined;
  disable = undefined;

  constructor() {
    makeAutoObservable(this);
    makePersistable(
      this,
      {
        name: 'eval-storage',
        properties: [
          'multipv',
          'searchms',
          'threads',
          'hashsize',
          'sri',
          'disable',
        ],
        storage: window.localStorage,
      },
      { delay: 0, fireImmediately: true }
    );
  }

  setMultiPv(number) {
    this.multipv = number;
  }

  setSearchMs(millis) {
    this.searchms = millis;
  }

  setThreads(number) {
    this.threads = number;
  }

  setSri(string) {
    this.sri = string;
  }

  setDisable(boolean) {
    this.disable = boolean;
  }

  get isTab() {
    return this.sri == window.site.sri;
  }
}
