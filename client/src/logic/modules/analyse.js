import chessBoard from 'chessboard';
import { validateFen } from 'chess.js';
import { Game } from '../lib/game/game';
import { throttle, isEvalBetter } from 'src/logic/lib/eval/util';
import { CevalCtrl } from 'src/logic/lib/eval/ctrl';
import { engineSupported } from 'src/logic/lib/eval/engine';

export class Analyse {
  constructor(ctrl, info) {
    this.name = info.name;
    this.controller = ctrl;
    this.initialFen = info.fen;
    this.stores = info.stores;
    this.status = 'analysis';
    this.game = new Game(info.fen);
    this.initCeval();
    this.startCeval();
  }

  /*----------GAME----------*/

  getGame() {
    return this.game;
  }

  clear() {
    this.game = undefined;
  }

  newGame(fen) {
    if (this.status === 'analysis') {
      if (!this.game) this.game = new Game(fen);
      this.initialFen = fen;
      this.game.load(fen);
      this.restartCeval();
    }
  }

  updateStatus(status, fen) {
    this.status = status;
    this.name = status;
    status === 'analysis' ? this.newGame(fen) : this.clear();
    this.initialFen = fen;
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
    this.stores.ui.set((state) => ({
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
    this.board = chessBoard(div, this.makeboardCfg());
    window.addEventListener('resize', this.board.resize);
  }

  destroyBoard() {
    window.removeEventListener('resize', this.board.resize);
    this.board.destroy();
    this.board = undefined;
  }

  makeboardCfg = () => {
    const boardConfig = new Map([
      [
        'analysis',
        {
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
        },
      ],
      [
        'editor',
        {
          pieceTheme: '/static/frontend/images/pieces/wiki/{piece}.png',
          position: this.initialFen,
          draggable: true,
          dropOffBoard: 'trash',
          sparePieces: true,
          hideSparePieces: false,
          onDragStart: () => {},
          onDrop: (s, t, p, newPos) => {
            this.stores.ui.set({
              fenPosition: this.board.objToFen(newPos),
            });
            this.stores.ui.set({
              isLegalFen: validateFen(this.stores.ui.get().fen()).ok,
            });
          },
          onSnapEnd: () => {},
        },
      ],
    ]);
    return boardConfig.get(this.status);
  };
}
