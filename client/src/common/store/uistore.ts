import { observable, action } from 'mobx';

export class UiStore {
  @observable accessor orientation = 'white';

  constructor() {}

  @action
  toggleOrientation(board) {
    board.toggleOrientation();
    this.orientation = this.orientation === 'white' ? 'black' : 'white';
  }
}
