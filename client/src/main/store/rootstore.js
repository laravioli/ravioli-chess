import { FenStore } from 'src/common/stores/fenstore';
import { UiStore } from 'src/common/stores/uistore';
import { AnalyseStore } from 'src/analyse/store/analyse';
import { EditorStore } from 'src/editor/store/editor';

class RootStore {
  constructor() {
    this.fenStore = new FenStore(this);
    this.analyseStore = new AnalyseStore(this);
    this.editorStore = new EditorStore(this);
    this.uiStore = new UiStore(this);
  }
}

export const rootStore = new RootStore();
window.root = rootStore;
