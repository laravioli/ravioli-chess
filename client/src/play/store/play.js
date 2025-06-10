import { Board } from 'src/lib/board/board';
import { action } from 'mobx';
import { pieceTheme } from 'src/lib/board/utils';

export class PlayStore {
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
      pieceTheme: pieceTheme('bases'),
      position: this.rootStore.fenStore.current,
      orientation: this.rootStore.uiStore.orientation,
      draggable: true,
      dropOffBoard: 'trash',
    };
  };
}
