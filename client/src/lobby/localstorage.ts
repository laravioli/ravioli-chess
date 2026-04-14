import { observable, action } from 'mobx';
import { persist } from '@/core/store/utils';

import type { TimeMode, LobbySide } from './interface';

@persist('lobby.settings', ['timeMode', 'time', 'increment', 'aiLevel', 'side'], { sync: true })
export class LobbySettings {
  @observable accessor timeMode: TimeMode = 'realTime';
  @observable accessor time: number = 5;
  @observable accessor increment: number = 0;
  @observable accessor aiLevel: number = 3;
  @observable accessor side: LobbySide = 'random';

  @action
  setTimeMode(string: TimeMode) {
    this.timeMode = string;
  }

  @action
  setTime(minutes: number) {
    this.time = minutes;
  }

  @action
  setIncrement(secondes: number) {
    this.increment = secondes;
  }

  @action
  setAiLevel(level: number) {
    this.aiLevel = level;
  }

  @action
  setSide(side: LobbySide) {
    this.side = side;
  }
}
