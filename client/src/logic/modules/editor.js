import { validateFen } from 'chess.js';

export class Editor {
  constructor(opts) {
    this.initialFen = opts.fen;
    this.store = opts.store;
  }

  onLoad = (opts) => {
    this.initialFen = opts.fen;
    this.setBoardCfg();
  };

  setBoardCfg = () => {
    const config = {
      position: this.initialFen,
      draggable: true,
      dropOffBoard: 'trash',
      sparePieces: true,
      hideSparePieces: false,
      onDragStart: () => {},
      onDrop: (s, t, p, newPos) => {
        this.store.set({
          fenPosition: this.board.objToFen(newPos),
        });
        this.store.set({
          isLegalFen: validateFen(this.store.get().fen()).ok,
        });
      },
      onSnapEnd: () => {},
    };
    this.store.set((state) => ({
      config: { ...state.config, ...config },
    }));
  };
}
