import chessBoard from 'chessboard';

export class Editor {
  constructor(opts, deps) {
    this.initialFen = opts.fen;
    this.fen = deps.fen;
  }

  onLoad(fen) {
    if (fen !== this.fen.current()) this.fen.setFen(fen);
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
      onDrop: (s, t, p, newPos) =>
        (this.fen.position = this.board.objToFen(newPos)),
    };
  };
}
