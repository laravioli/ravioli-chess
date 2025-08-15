import { observable, action, runInAction, remove } from "mobx";
import { Chessground } from "@lichess-org/chessground";
import {
  init,
  fromNodeList,
  last,
  updateAll,
  mainlineNodeList,
  Tree,
} from "src/lib/game/tree";
import { throttle } from "src/lib/common";
import { isEvalBetter } from "src/lib/eval/utils";
import { setRoot, nodeFromUser } from "./utils";
import { uciToMove } from "@lichess-org/chessground/util";
import { makeShapes } from "./autoshape";

export class AnalyseStore {
  board;
  ceval;
  tree;
  path;
  nodeList;
  @observable.ref accessor mainline;
  @observable.shallow accessor node;

  constructor(rootStore, { fen }) {
    window.analysis = this;
    runInAction(() => {
      this.ui = rootStore.uiStore;
      this.ceval = rootStore.cevalStore;
      this.initTree(fen);
      this.initCeval(fen);
    });
  }

  /* Loader */

  @action
  onLoad() {
    /* run AFTER the page is mounted */
    this.startCeval();
  }

  @action
  onUnLoad() {
    /* run AFTER the page is unmounted */
    this.ceval.stop();
  }

  /* Tree */

  @action
  initTree(fen) {
    if (!this.tree) this.tree = new Tree(setRoot(fen));
    else this.tree.root = setRoot(fen);
    this.setPath("");
  }

  reload(fen) {
    this.tree.root = setRoot(fen);
    this.jump("");
  }

  @action
  setPath(path) {
    this.path = path;
    this.nodeList = this.tree.getNodeList(path);
    this.node = last(this.nodeList);
    this.mainline = mainlineNodeList(this.tree.root);
  }

  @action
  jump(path) {
    const pathChanged = path !== this.path;
    this.setPath(path);
    if (pathChanged) {
      this.restartCeval();
    }
    this.updateBoard();
  }

  @action
  jumpNext() {
    const child = this.node.children[0];
    if (child) this.jump(this.path + child.id);
  }

  @action
  jumpPrev() {
    this.jump(init(this.path));
  }

  @action
  jumpLast() {
    this.jump(fromNodeList(this.mainline));
  }

  @action
  jumpFirst() {
    this.jump("");
  }

  /* Ceval */

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
    const node = this.node;
    if (ev.fen !== node.fen) return;
    if (!node.ceval || isEvalBetter(ev, node.ceval)) {
      node.ceval = ev;
    }
    this.setAutoShapes();
  }

  startCeval = throttle(800, () => {
    if (this.ceval?.enabled) {
      if (this.tree && !this.node.outcome) {
        this.ceval.start(this.nodeList, undefined);
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
    this.ceval?.stop();
    updateAll(this.tree.root, (node) => {
      delete node.ceval;
    });
    remove(this.node, "ceval");

    this.startCeval();
  }

  getBestEval(node) {
    return node.ceval && node.ceval.pvs[0].moves[0];
  }

  /*async playUci() {
    const best = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getBestEval(this.node));
      }, 1000);
    });
    //this.game.move(best); addNode
    //this.jump("move");
  }*/

  /* Board */

  mountBoard(div) {
    const config = this.makeBoardCfg();
    this.board = Chessground(div, config);
  }

  onUnMountBoard() {
    this.board.destroy();
  }

  turnColor(node) {
    return node.ply % 2 == 0 ? "white" : "black";
  }

  updateBoard() {
    this.board.set(this.cgOptions());
    this.setAutoShapes();
  }

  cgOptions = () => {
    const node = this.node;
    const color = this.turnColor(node);
    return {
      fen: node.fen,
      turnColor: color,
      movable: { color: color, dests: node.dests },
      check: node.check,
      lastMove: uciToMove(node.uci),
    };
  };

  onUserMove() {
    return (origin, dest, capture) => {
      const newNode = nodeFromUser(this.node, origin, dest, capture);
      const newPath = this.tree.addNode(newNode, this.path);
      this.jump(newPath);
    };
  }

  makeBoardCfg = () => {
    const opts = this.cgOptions();
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

  //reset autoshape before switching page : the problem is i should cancel the throtling of evaluation
  setAutoShapes = () => {
    this.board?.setAutoShapes(makeShapes(this));
  };
}
