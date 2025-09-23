import { makeAutoObservable } from 'mobx';

type Anon = 'friend' | 'random player' | 'computer';
type TimeMode = 'realTime' | 'unlimited';

export class LocalLobbyStorage {
  anon: Anon = 'friend';
  timeMode: TimeMode = 'realTime';
  time: number = 5;
  increment: number = 0;
  aiLevel: number = 3;
  side: Color = 'white';

  constructor() {
    makeAutoObservable(this);
  }

  setAnon(anon: Anon) {
    this.anon = anon;
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
