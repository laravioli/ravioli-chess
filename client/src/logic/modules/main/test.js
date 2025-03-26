import { Analyse } from './modules/analyse';
import { Editor } from './modules/editor';
import { Computer } from './modules/computer';
import { Online } from './modules/online';

export class Controller {
  modules = new Map([
    ['analyse', { make: () => new Analyse(this), current: undefined }],
    ['editor', { make: () => new Editor(this), current: undefined }],
    ['computer', { make: () => new Computer(this), current: undefined }],
    ['online', { make: () => new Online(this), current: undefined }],
  ]);

  constructor(stores) {
    this.stores = stores;
  }

  setState() {
    const states = {
      analyse: () => new Analyse(this, 'a'),
      editor: 'editoezaeazeazr',
    };
  }
}
