import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import type { TimeMode, LobbySide } from './interface';

export class LocalLobbyStorage {
  timeMode: TimeMode = 'realTime';
  time: number = 5;
  increment: number = 0;
  aiLevel: number = 3;
  side: LobbySide = 'random';

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: 'lobby-storage',
      properties: ['timeMode', 'time', 'increment', 'aiLevel', 'side'],
      storage: window.localStorage,
    });
  }

  setTimeMode(string: TimeMode) {
    this.timeMode = string;
  }

  setTime(minutes: number) {
    this.time = minutes;
  }

  setIncrement(secondes: number) {
    this.increment = secondes;
  }

  setAiLevel(level: number) {
    this.aiLevel = level;
  }

  setSide(side: LobbySide) {
    this.side = side;
  }
}
