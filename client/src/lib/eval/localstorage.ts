import { makeAutoObservable } from 'mobx';
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
  }

  setMultiPv(nb: number) {
    this.multipv = nb;
  }

  setSearchMs(millis: number) {
    this.searchms = millis;
  }

  setThreads(nb: number) {
    this.threads = nb;
  }

  setSri(sri: string) {
    this.sri = sri;
  }

  setDisable(nb: number) {
    this.disable = nb;
  }

  get isTab() {
    return this.sri == window.site.sri;
  }
}
