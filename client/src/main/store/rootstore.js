import { FenStore } from 'src/common/stores/fenstore';
import { AnalyseStore } from 'src/analyse/store/analyse';
import { EditorStore } from 'src/editor/store/editor';

class RootStore {
  constructor() {
    this.fenStore = new FenStore(this);
    this.analyseStore = new AnalyseStore(this);
    this.editorStore = new EditorStore(this);
  }
}

export const rootStore = new RootStore();
