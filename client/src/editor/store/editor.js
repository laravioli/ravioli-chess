import { Board } from 'src/lib/board/board';
import { action } from 'mobx';
import { pieceTheme } from 'src/lib/board/utils';

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
      pieceTheme: pieceTheme('wiki'),
      position: this.rootStore.fenStore.current,
      orientation: this.rootStore.uiStore.orientation,
      draggable: true,
      dropOffBoard: 'trash',
      sparePieces: true,
      hideSparePieces: false,
      onDrop: action((s, t, p, newPos) => {
        this.rootStore.fenStore.position = this.board.objToFen(newPos);
      }),
    };
  };
}
