import { Analyse } from './subcontrollers/analyse';
import { Editor } from './subcontrollers/editor';
import { Computer } from './subcontrollers/computer';
import { Online } from './subcontrollers/online';

export class Controller {
  states = new Map([
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
