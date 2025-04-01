import chessBoard from 'chessboard';
import { Game } from 'src/logic/lib/game/game';
import { throttle, isEvalBetter } from 'src/logic/lib/eval/util';
import { CevalCtrl } from 'src/logic/lib/eval/ctrl';
import { engineSupported } from 'src/logic/lib/eval/engine';

export class Analyse {
  constructor(opts) {
    this.initialFen = opts.fen;
    this.store = opts.store;
    this.game = new Game(opts.fen);
    this.initCeval();
    this.startCeval();
  }

  onLoad(fen) {
    this.initialFen = fen;
    this.newGame(fen);
  }

  onUnLoad() {
    this.ceval.stop();
  }

  /*----------GAME----------*/

  getGame() {
    return this.game;
  }

  newGame(fen) {
    if (!this.game) this.game = new Game(fen);
    this.game.load(fen);
    this.restartCeval();
  }

  jump(action) {
    if (action === 'move') this.game.appendMove();
    else if (action === 'undo') this.game.undoMove();
    else if (action === 'redo') this.game.redoMove();
    else if (action === 'start') this.game.goStart();
    else if (action === 'end') this.game.goEnd();
    this.restartCeval();
    this.board.position(this.game.currentMove.fen, true);
    this.setFen();
  }

  /*----------EVAL----------*/

  initCeval() {
    const opts = {
      initialFen: this.initialFen,
      possible: engineSupported(),
      emit: (ev) => {
        this.onNewCeval(ev);
      },
    };
    if (this.ceval) this.ceval.setOpts(opts);
    else {
      this.ceval = new CevalCtrl(opts);
    }
    this.store.set({ evalEnabled: this.ceval.enabled() });
  }

  onNewCeval(ev) {
    let move = this.game.currentMove;
    if (!move.ceval || isEvalBetter(ev, move.ceval)) move.ceval = ev;
    console.log(ev);
  }

  startCeval = throttle(800, () => {
    if (this.ceval?.enabled()) {
      if (this.game && !this.game.isGameOver()) {
        this.ceval.start(this.game.moveList, undefined);
      } else {
        this.ceval.stop();
      }
    }
  });

  restartCeval() {
    this.ceval?.stop();
    this.startCeval();
  }

  toggleCeval() {
    this.ceval?.toggle();
    this.store.set({ evalEnabled: this.ceval.enabled() });
    this.startCeval();
  }

  getCeval = () => this.ceval;

  /*----------STORE----------*/

  setFen() {
    const castlingRights =
      this.game.turn() === 'w'
        ? this.game.getCastlingRights('b')
        : Object.fromEntries(
            Object.entries(this.game.getCastlingRights('w')).map(
              ([key, value]) => [key.toUpperCase(), value]
            )
          );
    this.store.set((state) => ({
      fenPosition: this.game.fen().split(' ')[0],
      turn: this.game.turn(),
      castling: { ...state.castling, ...castlingRights },
      halfmove: this.game.fen().split(' ')[4],
      fullmove: this.game.moveNumber(),
    }));
  }

  /*----------BOARD----------*/

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
      dropOffBoard: 'snapback',
      sparePieces: true,
      hideSparePieces: true,
      onDragStart: (source, piece) => {
        if (this.game?.isGameOver()) return false;
        if (
          (this.game?.turn() === 'w' && piece.search(/^b/) !== -1) ||
          (this.game?.turn() === 'b' && piece.search(/^w/) !== -1)
        ) {
          return false;
        }
      },
      onDrop: (source, target) => {
        try {
          this.game.move(source, target);
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          return 'snapback';
        }
      },
      onSnapEnd: () => {
        this.jump('move');
      },
    };
  };
}
