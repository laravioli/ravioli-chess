import { Chessground } from "@lichess-org/chessground";
import { uciToMove } from "@lichess-org/chessground/util";
import { Game } from "src/lib/game/game";
import { Fen } from "src/lib/fen/fen";
import { throttle, isEvalBetter } from "src/lib/eval/utils";
import { makeShapes } from "./utils";
import { observable, action, runInAction } from "mobx";

export class AnalyseStore {
  board = undefined;
  game = undefined;
  fen = undefined;
  ceval = undefined;
  @observable.ref accessor evaluation = undefined;

  constructor(rootStore, { fen }) {
    runInAction(() => {
      this.ui = rootStore.uiStore;
      this.ceval = rootStore.cevalStore;
      this.game = new Game(fen);
      this.fen = new Fen(fen);
      this.initCeval(fen);
    });
  }

  /* loader */

  @action
  onLoad() {
    /* code run AFTER the page is mounted */
    this.startCeval();
  }

  @action
  onUnLoad() {
    /* run AFTER the page is unmounted */
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
    this.fen.set(move.fen);
    this.updateBoard();
  }

  /* ceval */

  initCeval(fen) {
    const opts = {
      initialFen: fen,
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
    this.setAutoShapes();
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
    this.setAutoShapes();
    this.startCeval();
  }

  @action
  clearEvals() {
    this.game.line.forEach((move) => {
      if (move.ceval) move.ceval = null;
    });
  }

  getBestEval(move) {
    return move.ceval && move.ceval.pvs[0].moves[0];
  }

  async playUci() {
    const best = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getBestEval(this.game.currentMove));
      }, 1000);
    });
    this.game.move(best);
    this.jump("move");
  }

  /* board */

  mountBoard(div) {
    const config = this.makeBoardCfg();
    this.board = Chessground(div, config);
  }

  onUnMountBoard() {
    this.board.destroy();
  }

  turnColor(move) {
    return move.ply % 2 == 0 ? "white" : "black";
  }

  updateBoard() {
    this.board.set(this.moveBoardCfg());
    this.setAutoShapes();
  }

  moveBoardCfg = () => {
    const move = this.game.currentMove;
    const color = this.turnColor(move);
    return {
      fen: move.fen,
      turnColor: color,
      movable: { color: color, dests: move.dests },
      check: move.check,
      lastMove: uciToMove(move.uci),
    };
  };

  onUserMove() {
    return (orig, dest) => {
      this.game.move({ from: orig, to: dest });
      this.jump("move");
    };
  }

  makeBoardCfg = () => {
    const opts = this.moveBoardCfg();
    return {
      fen: opts.fen,
      turnColor: opts.turnColor,
      movable: {
        free: false,
        color: opts.movable.color,
        dests: opts.movable.dests,
      },
      orientation: this.ui.orientation,
      draggable: { showGhost: true },
      events: { move: this.onUserMove() },
    };
  };

  setAutoShapes = () => {
    this.board?.setAutoShapes(makeShapes(this));
  };
}
