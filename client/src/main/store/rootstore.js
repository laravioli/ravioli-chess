import { FenStore } from 'src/common/stores/fenstore';
import { UiStore } from 'src/common/stores/uistore';
import { AnalyseStore } from 'src/analyse/store/analyse';
import { EditorStore } from 'src/editor/store/editor';
import { PlayStore } from 'src/play/store/play';

class RootStore {
  constructor() {
    this.fenStore = new FenStore(this);
    this.analyseStore = new AnalyseStore(this);
    this.editorStore = new EditorStore(this);
    this.playStore = new PlayStore(this);
    this.uiStore = new UiStore(this);
  }
}

export const rootStore = new RootStore();
export const storeRouter = {
  '/analysis': rootStore.analyseStore,
  '/editor': rootStore.editorStore,
  '/play': rootStore.playStore,
};
