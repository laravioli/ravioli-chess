import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";

export class LocalLobbyStorage {
  anon = "friend";
  timeMode = "realTime";
  time = 5;
  increment = 0;
  aiLevel = 3;
  side = "white";

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: "lobby-storage",
      properties: ["anon", "timeMode", "time", "increment", "aiLevel", "side"],
      storage: window.localStorage,
    });
  }

  setAnon(string) {
    this.anon = string;
  }

  setTimeMode(string) {
    this.timeMode = string;
  }

  setTime(minutes) {
    this.time = minutes;
  }

  setIncrement(secondes) {
    this.increment = secondes;
  }

  setAiLevel(level) {
    this.aiLevel = level;
  }

  setSide(side) {
    this.side = side;
  }
}
