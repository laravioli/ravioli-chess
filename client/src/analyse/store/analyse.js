import { Board } from 'src/lib/board/board';
import { Game } from 'src/lib/game/game';
import { Fen } from 'src/lib/fen/fen';
import { engineSupported } from 'src/lib/eval/engine';
import { throttle, isEvalBetter } from 'src/lib/eval/util';
import { observable, action, runInAction } from 'mobx';
import { pieceTheme } from 'src/lib/board/utils';

export class AnalyseStore {
  board = new Board();
  game = undefined;
  fen = undefined;
  ceval = undefined;
  @observable.ref accessor evaluation = undefined;

  constructor(rootStore, { fen }) {
    runInAction(() => {
      this.rootStore = rootStore;
      this.ceval = this.rootStore.cevalStore;
      this.game = new Game(fen);
      this.fen = new Fen(fen);
      this.initCeval(fen);
    });
  }

  /* loader */

  @action
  onLoad() {
    this.startCeval();
  }

  @action
  onUnLoad() {
    this.ceval.stop();
  }

  /* game */

  @action
  newGame(fen) {
    if (fen !== this.fen.current) this.fen.set(fen);
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
    this.fen.set(move.fen);
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
    this.ceval.setOpts(opts);
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
    this.game.move(best);
    this.jump('move');
  }

  /* board */

  makeBoardCfg = () => ({
    pieceTheme: pieceTheme('bases'),
    position: this.fen.current,
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
        this.game.move({
          from: source,
          to: target,
          promotion: 'q',
        });
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
