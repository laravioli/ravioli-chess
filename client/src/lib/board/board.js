import chessBoard from 'chessboard';
import { action } from 'mobx';
import { objectMap } from './utils';

export class Board {
  @action
  mount(div, fnConfig) {
    const board = chessBoard(div, fnConfig);
    Object.assign(
      this,
      objectMap(board, (fn) => action(fn))
    );
    window.addEventListener('resize', this.resize);
  }

  @action
  unMount() {
    window.removeEventListener('resize', this.resize);
    this.destroy();
  }
}
