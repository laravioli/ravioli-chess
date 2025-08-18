//https://github.com/lichess-org/lila/blob/master/ui/analyse/src/ctrl.ts
import { observable, action, runInAction } from "mobx";
import { Chessground } from "@lichess-org/chessground";
import { TreePath, TreeOps, Tree } from "src/lib/game/tree";
import { throttle } from "src/lib/common";
import { isEvalBetter } from "src/lib/eval/utils";
import { makeObservableNode, makeRoot, makeNode } from "./node";
import { uciToMove } from "@lichess-org/chessground/util";
import { makeShapes } from "./autoshape";

export class AnalyseStore {
  board;
  tree;
  ceval;
  path;
  nodeList;
  @observable.ref accessor mainline;
  @observable.ref accessor node;

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
    this.tree = new Tree(makeObservableNode(makeRoot(fen)));
    this.setPath("");
  }

  @action
  reload(fen) {
    this.tree.root = makeObservableNode(makeRoot(fen));
    this.jump("");
  }

  @action
  setPath(path) {
    this.path = path;
    this.nodeList = this.tree.getNodeList(path);
    this.node = TreeOps.last(this.nodeList);
    this.mainline = TreeOps.mainlineNodeList(this.tree.root);
  }

  @action
  jump(path) {
    this.setPath(path);
    this.restartCeval();
    this.updateBoard();
  }

  @action
  jumpNext() {
    const child = this.node.children[0];
    if (child) this.jump(this.path + child.id);
  }

  @action
  jumpPrev() {
    this.jump(TreePath.init(this.path));
  }

  @action
  jumpLast() {
    this.jump(TreePath.fromNodeList(this.mainline));
  }

  @action
  jumpFirst() {
    this.jump("");
  }

  /* Ceval */

  initCeval(fen) {
    const opts = {
      initialFen: fen,
      emit: (ev, work) => {
        this.onNewCeval(ev, work.path);
      },
    };
    this.ceval.setOpts(opts);
  }

  @action
  onNewCeval(ev, path) {
    this.tree.updateAt(path, (node) => {
      if (ev.fen !== node.fen) return;
      if (!node.ceval || isEvalBetter(ev, node.ceval)) {
        node.ceval = ev;
      }
      if (path === this.path) this.setAutoShapes();
    });
  }

  startCeval = throttle(800, () => {
    if (this.ceval?.enabled) {
      if (this.tree && !this.node.outcome) {
        this.ceval.start(this.path, this.nodeList, undefined);
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
    TreeOps.updateAll(this.tree.root, (node) => {
      node.ceval = undefined;
    });
    this.startCeval();
  }

  getBestEval(node) {
    return node.ceval && node.ceval.pvs[0].moves[0];
  }

  /* Board */

  mountBoard(div) {
    const config = this.makeBoardCfg();
    this.board = Chessground(div, config);
  }

  onUnMountBoard() {
    this.board.destroy();
    this.board = undefined;
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
      const parent = this.node;
      const newNode = makeObservableNode(makeNode(parent, origin, dest));
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

  setAutoShapes = () => {
    this.board?.setAutoShapes(makeShapes(this));
  };
}
