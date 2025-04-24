import { FenStore } from 'src/common/stores/fenstore';

class RootStore {
  constructor() {
    this.fenStore = new FenStore(this);
  }
}

export const rootStore = new RootStore();
