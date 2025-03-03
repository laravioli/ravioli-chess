import { throttle, povChances, isEvalBetter } from './util';
import { CevalCtrl } from './ctrl';

export class Analyse {
  constructor() {
    this.initCeval();
    this.initialPath = 0;
    this.setPath(this.initialPath);
    this.startCeval();
  }

  initCeval() {
    const opts = {
      initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      possible: true,
      emit: (ev, work) => {
        this.onNewCeval(ev, work.path);
      },
    };
    if (this.ceval) this.ceval.init(opts);
    else this.ceval = new CevalCtrl(opts);
  }

  onNewCeval = (ev, path) => {
    console.log(ev, path);
    let node = this.nodeList.at(-1);
    if (!node.ceval || isEvalBetter(ev, node.ceval)) node.ceval = ev;

    /*this.tree.updateAt(path, (node) => {
      if (node.fen !== ev.fen) return;


      //if (path === this.path) {
      //this.setAutoShapes();
      //}
    });*/
  };

  startCeval = throttle(800, () => {
    if (this.ceval?.enabled()) {
      //add condition when game is over(if start else stop)
      this.ceval.start(this.path, this.nodeList, undefined);
    }
  });

  restartCeval() {
    this.ceval.stop();
    this.startCeval();
  }

  setPath = (path) => {
    this.path = path;
    this.nodeList = [
      {
        ply: 0,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      },
      {
        ply: 0,
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        uci: 'e2e4',
      },
    ];
  };

  toggleCeval = () => {
    this.ceval.toggle();
    //this.setAutoShapes();
    this.startCeval();
  };

  clearCeval() {
    this.tree.removeCeval();
    this.evalCache.clear();
    this.restartCeval();
  }

  getScore(ev) {
    return povChances(ev.ply, ev);
  }
}
