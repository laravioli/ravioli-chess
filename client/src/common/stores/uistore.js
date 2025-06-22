import { observable, action } from 'mobx';

export class UiStore {
  @observable accessor orientation = 'white';
  @observable accessor name = 'Anonymous';

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  toggleOrientation(board) {
    board.flip();
    this.orientation = this.orientation === 'white' ? 'black' : 'white';
    document.querySelector('.board').dataset.side = this.orientation;
  }

  @action
  setName(name) {
    this.name = name;
  }
}
