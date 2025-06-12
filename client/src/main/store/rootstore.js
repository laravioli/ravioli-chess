import { Ceval } from 'src/lib/eval/ceval';
import { UiStore } from 'src/common/stores/uistore';
import { AnalyseStore } from 'src/analyse/store/analyse';
import { EditorStore } from 'src/editor/store/editor';
import { PlayStore } from 'src/play/store/play';
import { DEFAULT_POSITION } from 'chess.js';

class RootStore {
  constructor() {
    this.uiStore = new UiStore(this);
    this.cevalStore = new Ceval({
      possible: true,
      initialFen: DEFAULT_POSITION,
    });
  }
}

export const rootStore = new RootStore();
export const PageStoreRouter = {
  '/analysis': AnalyseStore,
  '/editor': EditorStore,
  '/play': PlayStore,
};
