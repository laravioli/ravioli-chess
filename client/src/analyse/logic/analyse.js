import chessBoard from 'chessboard';
import { Game } from 'src/lib/game/game';
import { Eval } from 'src/lib/eval/ctrl';
import { engineSupported } from 'src/lib/eval/engine';
import { throttle, isEvalBetter } from 'src/lib/eval/util';

export class Analyse {
  constructor(opts, deps) {
    window.analysis = this;

    this.initialFen = opts.fen;
    this.fen = deps.fen;
    this.newGame(opts.fen);
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
    if (!this.game) {
      this.game = new Game(fen);
    } else {
      if (fen !== this.fen.current) this.fen.setFen(fen);
      this.game.load(fen);
      this.restartCeval();
    }
    if (!this.ceval || !this.ceval.enabled) this.evaluation = null;
  }

  jump(action) {
    this.game.jump(action);

    const move = this.game.currentMove;
    if (move.ceval || !this.ceval.enabled) this.evaluation = move.ceval;
    this.restartCeval();
    this.board.position(move.fen, true);
    this.fen.setFen(move.fen);
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
      this.ceval = new Eval(opts);
    }
  }

  onNewCeval(ev) {
    let move = this.game.currentMove;
    if (ev.fen !== move.fen) return;
    if (!move.ceval || isEvalBetter(ev, move.ceval)) {
      move.ceval = ev;
      this.evaluation = ev;
    }
  }

  startCeval = throttle(800, () => {
    if (this.ceval?.enabled) {
      if (this.game && !this.game.isGameOver()) {
        this.ceval.start(this.game.line, undefined);
      } else {
        this.ceval.stop();
      }
    }
  });

  restartCeval() {
    this.ceval.stop();
    this.startCeval();
  }

  toggleCeval() {
    this.ceval?.toggle();
    this.startCeval();
  }

  getCeval = () => this.ceval;

  clearEvals = () => {
    this.game.line.forEach((move) => {
      if (move.ceval) move.ceval = null;
    });
  };

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
