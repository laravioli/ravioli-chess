import { Board } from 'src/lib/board/board';
import { Game } from 'src/lib/game/game';
import { Ceval } from 'src/lib/eval/ceval';
import { engineSupported } from 'src/lib/eval/engine';
import { throttle, isEvalBetter } from 'src/lib/eval/util';
import { observable, action } from 'mobx';

export class AnalyseStore {
  board = new Board();
  game = undefined;
  ceval = undefined;
  @observable.ref accessor evaluation = undefined;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  /* loader */

  @action
  onLoad() {
    const fen = this.rootStore.fenStore.current;
    this.game ? this.game.load(fen) : (this.game = new Game(fen));
    this.initCeval(fen);
    this.startCeval();
  }

  @action
  onUnLoad() {
    this.game.clear();
    this.ceval.stop();
    this.evaluation = undefined;
  }

  /* game */

  @action
  newGame(fen) {
    if (fen !== this.rootStore.fenStore.current)
      this.rootStore.fenStore.set(fen);
    this.game.load(fen);
    this.restartCeval();

    if (!this.ceval || !this.ceval.enabled) this.evaluation = null;
  }

  @action
  jump(action) {
    this.game.jump(action);

    const move = this.game.currentMove;
    if (!this.ceval.enabled || move.ceval || move.outcome)
      this.evaluation = move.ceval;
    this.restartCeval();
    this.board.position(move.fen, true);
    this.rootStore.fenStore.set(move.fen);
  }

  /* ceval */

  initCeval(fen) {
    const opts = {
      initialFen: fen,
      possible: engineSupported(),
      emit: (ev) => {
        this.onNewCeval(ev);
      },
    };
    if (this.ceval) this.ceval.setOpts(opts);
    else {
      this.ceval = new Ceval(opts);
    }
  }

  @action
  onNewCeval(ev) {
    let move = this.game.currentMove;
    if (ev.fen !== move.fen) return;
    if (!move.ceval || isEvalBetter(ev, move.ceval)) {
      move.ceval = this.evaluation = ev;
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

  @action
  restartCeval() {
    this.ceval.stop();
    this.startCeval();
  }

  @action
  toggleCeval() {
    this.ceval?.toggle();
    this.startCeval();
  }

  @action
  clearEvals() {
    this.game.line.forEach((move) => {
      if (move.ceval) move.ceval = null;
    });
  }

  getBestEval(node) {
    return node.ceval && node.ceval.pvs[0].moves[0];
  }

  async playUci() {
    const best = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getBestEval(this.game.currentMove));
      }, 1000);
    });
    console.log('best');
    this.game._chess.move(best);
    this.jump('move');
  }

  /* board */

  makeBoardCfg = () => ({
    pieceTheme: '/static/frontend/images/pieces/wiki/{piece}.png',
    position: this.rootStore.fenStore.current,
    orientation: this.rootStore.uiStore.orientation,
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
  });
}
