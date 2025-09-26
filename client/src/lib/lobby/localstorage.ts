import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';

type TimeMode = 'realTime' | 'unlimited';

export class LocalLobbyStorage {
  timeMode: TimeMode = 'realTime';
  time: number = 5;
  increment: number = 0;
  aiLevel: number = 3;
  side: Color = 'white';

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

  setSide(side: Color) {
    this.side = side;
  }
}
