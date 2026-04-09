//https://github.com/lichess-org/lila/blob/master/ui/analyse/src/ctrl.ts
import { observable, action, computed } from 'mobx';
import { Chessground } from '@lichess-org/chessground';
import type { Api as ChessgroundApi } from '@lichess-org/chessground/api';
import { uciToMove, opposite } from '@lichess-org/chessground/util';

import { TreePath, TreeOps, Tree } from '@/lib/tree/tree';
import { throttle } from '@/lib/common';
import { isEvalBetter } from '@/lib/eval/utils';
import type { Ceval } from '@/lib/eval/ceval';
import type { CevalOpts, ClientEval } from '@/lib/eval/interface';
import type { Node, Path } from '@/lib/tree/interface';

import { makeObservableNode, makeRoot, makeNode } from './node';
import { makeShapes } from './autoshape';
import type { AnalyseOpts, JustCaptured } from './interface';
import { wsConnect } from '@/lib/socket/socket';

export class AnalyseStore {
  board: ChessgroundApi | undefined;
  ceval: Ceval;

  tree: Tree;
  path: Path;
  nodeList: Node[];
  mainline: Node[];
  @observable.ref accessor node: Node;

  opts: AnalyseOpts;

  @observable accessor isFlipped = false;

  constructor(ceval: Ceval, opts: AnalyseOpts) {
    this.opts = opts;
    this.ceval = ceval;
    this.initTree(opts.fen);
    this.initCeval(opts.fen);
  }

  /* Loader */

  @action
  onLoad() {
    /* run AFTER the page is mounted */
    this.startCeval();
    wsConnect('/socket/site');
  }

  @action
  onUnLoad() {
    /* run AFTER the page is unmounted */
    this.ceval.stop();
  }

  /* Tree */

  @action
  initTree(fen: FEN) {
    this.tree = new Tree(makeObservableNode(makeRoot(fen)));
    this.setPath('');
  }

  @action
  reload(fen: FEN) {
    this.tree.root = makeObservableNode(makeRoot(fen));
    this.jump('');
  }

  @action
  setPath(path: Path) {
    this.path = path;
    this.nodeList = this.tree.getNodeList(path);
    this.node = TreeOps.last(this.nodeList);
    this.mainline = TreeOps.mainlineNodeList(this.tree.root);
  }

  @action
  jump(path: Path) {
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
    this.jump('');
  }

  /* Ceval */

  initCeval(fen: FEN) {
    const opts: CevalOpts = {
      allowed: true,
      initialFen: fen,
      emit: (ev, work) => {
        this.onNewCeval(ev, work.path);
      },
    };
    this.ceval.init(opts);
  }

  @action
  onNewCeval(ev: ClientEval, path: Path) {
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

  getBestEval(node: Node) {
    return node.ceval && node.ceval.pvs[0].moves[0];
  }

  /* Board */

  mountBoard(div: HTMLElement) {
    const config = this.makeBoardCfg();
    this.board = Chessground(div, config);
  }

  onUnMountBoard() {
    this.board?.destroy();
    this.board = undefined;
  }

  turnColor(node: Node) {
    return node.ply % 2 == 0 ? 'white' : 'black';
  }

  @action
  flip() {
    this.board?.toggleOrientation();
    this.isFlipped = !this.isFlipped;
  }

  @computed
  get orientation() {
    return this.isFlipped ? opposite(this.opts.orientation) : this.opts.orientation;
  }

  updateBoard() {
    this.board?.set(this.cgOptions());
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
    } as const;
  };

  onUserMove() {
    return (origin: Key, dest: Key, _capture?: JustCaptured) => {
      const parent = this.node;
      const newNode = makeObservableNode(makeNode(parent, origin, dest));
      const newPath = this.tree.addNode(newNode, this.path);

      if (!newPath) {
        console.log("Can't addNode", newNode, this.path);
        return;
      }
      this.jump(newPath);
    };
  }

  makeBoardCfg = (): CgConfig => {
    const opts = this.cgOptions();
    return {
      fen: opts.fen,
      turnColor: opts.turnColor,
      movable: {
        free: false,
        color: opts.movable.color,
        dests: opts.movable.dests,
      },
      orientation: this.opts.orientation,
      draggable: { showGhost: true },
      events: { move: this.onUserMove() },
    };
  };

  setAutoShapes = () => {
    this.board?.setAutoShapes(makeShapes(this));
  };
}
