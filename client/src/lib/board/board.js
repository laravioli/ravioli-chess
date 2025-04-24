import chessBoard from 'chessboard';
import { action } from 'mobx';

export class Board {
  widget = undefined;

  @action
  set(div, fnConfig) {
    this.widget?.destroyBoard();
    this.widget = chessBoard(div, fnConfig);
    window.addEventListener('resize', this.widget.resize);
  }

  @action
  destroy() {
    window.removeEventListener('resize', this.widget.resize);
    this.widget.destroy();
    this.widget = null;
  }

  @action
  clear = (useAnimation) => this.widget.clear(useAnimation);

  @action
  fen = () => this.widget.fen();

  @action
  flip = () => this.widget.flip();

  @action
  position = (newPosition, useAnimation) =>
    this.widget.position(newPosition, useAnimation);

  @action
  start = (useAnimation) => this.widget.start(useAnimation);

  objToFen = (pos) => this.widget.objToFen(pos);
}
