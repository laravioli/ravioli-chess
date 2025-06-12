import { Board } from 'src/lib/board/board';
import { Fen } from 'src/lib/fen/fen';
import { action, runInAction } from 'mobx';
import { pieceTheme } from 'src/lib/board/utils';

export class EditorStore {
  board = new Board();
  fen = undefined;

  constructor(rootStore, { fen }) {
    runInAction(() => {
      this.rootStore = rootStore;
      this.fen = new Fen(fen);
    });
  }

  @action
  onLoad() {}

  @action
  onUnLoad() {}

  makeBoardCfg = () => {
    return {
      pieceTheme: pieceTheme('bases'),
      position: this.fen.current,
      orientation: this.rootStore.uiStore.orientation,
      draggable: true,
      dropOffBoard: 'trash',
      sparePieces: true,
      hideSparePieces: false,
      onDrop: action((s, t, p, newPos) => {
        this.fen.position = this.board.objToFen(newPos);
      }),
    };
  };
}
