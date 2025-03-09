import { Game } from '../../game/game';
import { throttle, isEvalBetter } from '../../eval/util';
import { CevalCtrl } from '../../eval/ctrl';
import { engineSupported } from '../../eval/engine';
import { evalStore } from 'src/stores/';

export class Analyse {
  constructor(info) {
    window.analysis = this;
    this.initialFen = info.fen;
    this.status = 'analyse';
    this.game = new Game(info.fen);
    this.initCeval();
    this.startCeval();
  }

  clear() {
    this.initialFen = undefined;
    this.game = undefined;
  }

  newGame(fen) {
    if (this.status === 'analyse') {
      if (!this.game) this.game = new Game(fen);
      this.initialFen = fen;
      this.game.load(fen);
      this.restartCeval();
    }
  }

  updateStatus(status, fen) {
    this.status = status;
    status === 'analyse' ? this.newGame(fen) : this.clear();
  }

  jump(action) {
    if (action === 'move') this.game.appendMove();
    else if (action === 'undo') this.game.undoMove();
    else if (action === 'redo') this.game.redoMove();
    else if (action === 'start') this.game.goStart();
    else if (action === 'end') this.game.goEnd();
    this.restartCeval();
  }

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
      evalStore.subscribe(
        (state) => state.disable,
        (disable) => {
          console.log('hello');
          this.ceval.enabled(!disable);
          this.restartCeval();
        }
      );
    }
  }

  onNewCeval(ev) {
    console.log(ev);
    let move = this.game.currentMove;
    if (!move.ceval || isEvalBetter(ev, move.ceval)) move.ceval = ev;
  }

  startCeval = throttle(800, () => {
    if (this.ceval?.enabled()) {
      if (this.game && !this.game.isGameOver()) {
        console.log('startceval :  a new eval');
        this.ceval.start(this.game.moveList, undefined);
      } else {
        this.ceval.stop();
      }
    } else {
      console.log('startceval : ceval disabled');
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
}
