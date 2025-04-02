import chessBoard from 'chessboard';
import { validateFen } from 'chess.js';

export class Editor {
  constructor(opts) {
    this.initialFen = opts.fen;
    this.store = opts.store;
  }

  onLoad(fen) {
    this.initialFen = fen;
  }

  onUnLoad() {}

  getBoard() {
    return this.board;
  }

  setBoard(div) {
    if (this.board) this.destroyBoard();
    this.board = chessBoard(div, this.makeBoardCfg());
    window.addEventListener('resize', this.board.resize);
  }

  destroyBoard() {
    window.removeEventListener('resize', this.board.resize);
    this.board.destroy();
    this.board = undefined;
  }

  makeBoardCfg = () => {
    return {
      pieceTheme: '/static/frontend/images/pieces/wiki/{piece}.png',
      position: this.initialFen,
      draggable: true,
      dropOffBoard: 'trash',
      sparePieces: true,
      hideSparePieces: false,
      onDrop: (s, t, p, newPos) => {
        this.store.set({
          fenPosition: this.board.objToFen(newPos),
        });
        this.store.set({
          isLegalFen: validateFen(this.store.get().fen()).ok,
        });
      },
    };
  };
}
