import { Board } from 'src/lib/board/board';
import { action } from 'mobx';

export class EditorStore {
  board = new Board();

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  onLoad() {}

  @action
  onUnLoad() {}

  makeBoardCfg = () => {
    return {
      pieceTheme: '/static/frontend/images/pieces/wiki/{piece}.png',
      position: this.rootStore.fenStore.current,
      orientation: this.rootStore.uiStore.orientation,
      draggable: true,
      dropOffBoard: 'trash',
      sparePieces: true,
      hideSparePieces: false,
      onDrop: action(
        (s, t, p, newPos) =>
          (this.rootStore.fenStore.position = this.board.objToFen(newPos))
      ),
    };
  };
}
