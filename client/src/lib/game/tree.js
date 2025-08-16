//https://github.com/lichess-org/lila/blob/master/ui/lib/src/tree/tree.ts
//path

const head = (path) => path.slice(0, 2);
const tail = (path) => path.slice(2);

export const TreePath = {
  init(path) {
    return path.slice(0, -2);
  },
  fromNodeList(nodes) {
    return nodes.map((n) => n.id).join("");
  },
};

//ops

function findChildById(node, id) {
  return node.children.find((n) => n.id === id);
}

function collect(from, pickChild) {
  const nodes = [from];
  let n = from,
    c;
  while ((c = pickChild(n))) {
    nodes.push(c);
    n = c;
  }
  return nodes;
}

export const TreeOps = {
  last(nodeList) {
    return nodeList[nodeList.length - 1];
  },
  updateAll(root, f) {
    // applies f recursively to all nodes
    function update(node) {
      f(node);
      node.children.forEach(update);
    }
    update(root);
  },
  mainlineNodeList(from) {
    return collect(from, (node) => node.children[0]);
  },
};
//tree

export class Tree {
  constructor(root) {
    this.root = root;
  }

  getNodeList = (path) =>
    collect(this.root, function (node) {
      const id = head(path);
      if (id === "") return;
      path = tail(path);
      return findChildById(node, id);
    });

  findNode = (path) => this.findNodeFrom(this.root, path);

  findNodeFrom(node, path) {
    if (path === "") return node;
    const child = findChildById(node, head(path));
    return child ? this.findNodeFrom(child, tail(path)) : undefined;
  }

  updateAt(path, update) {
    const node = this.findNode(path);
    if (node) update(node);
    return node;
  }

  addNode(node, path) {
    const newPath = path + node.id;
    if (this.findNode(newPath)) return newPath;
    return this.updateAt(path, (n) => n.children.push(node))
      ? newPath
      : undefined;
  }
}
