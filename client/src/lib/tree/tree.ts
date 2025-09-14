//https://github.com/lichess-org/lila/blob/master/ui/lib/src/tree/tree.ts

import { observable } from 'mobx';
import type { Path, TOps, TPath, Node, MaybeNode } from './interface';

const head = (path: Path) => path.slice(0, 2);
const tail = (path: Path) => path.slice(2);

export const TreePath: TPath = {
  init(path) {
    return path.slice(0, -2);
  },
  fromNodeList(nodes) {
    return nodes.map(n => n.id).join('');
  },
};

//ops

function findChildById(node: Node, id: string): MaybeNode {
  return node.children.find(n => n.id === id);
}

function collect(from: Node, pickChild: (n: Node) => MaybeNode) {
  const nodes = [from];
  let n = from,
    c;
  while ((c = pickChild(n))) {
    nodes.push(c);
    n = c;
  }
  return nodes;
}

export const TreeOps: TOps = {
  last(nodeList) {
    return nodeList[nodeList.length - 1];
  },
  updateAll(root, f) {
    // applies f recursively to all nodes
    function update(node: Node) {
      f(node);
      node.children.forEach(update);
    }
    update(root);
  },
  mainlineNodeList(from) {
    return collect(from, node => node.children[0]);
  },
};
//tree

export class Tree {
  @observable.ref accessor root: Node;

  constructor(root: Node) {
    this.root = root;
  }

  getNodeList = (path: Path) =>
    collect(this.root, function (node) {
      const id = head(path);
      if (id === '') return;
      path = tail(path);
      return findChildById(node, id);
    });

  findNode = (path: Path) => this.findNodeFrom(this.root, path);

  findNodeFrom(node: Node, path: Path): MaybeNode {
    if (path === '') return node;
    const child = findChildById(node, head(path));
    return child ? this.findNodeFrom(child, tail(path)) : undefined;
  }

  updateAt(path: Path, update: (node: Node) => void) {
    const node = this.findNode(path);
    if (node) update(node);
    return node;
  }

  addNode(node: Node, path: Path) {
    const newPath = path + node.id;
    if (this.findNode(newPath)) return newPath;
    return this.updateAt(path, n => n.children.push(node)) ? newPath : undefined;
  }
}
