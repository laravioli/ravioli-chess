//https://github.com/lichess-org/lila/blob/master/ui/lib/src/tree/tree.ts

//path
const head = (path) => path.slice(0, 2);
const tail = (path) => path.slice(2);
//ops

function findChildbyId(node, id) {
  return node.children.find((n) => n.id === id);
}
//tree
export class Tree {
  constructor(root) {
    this.root = root;
  }

  pathIsMainline(path) {
    pathIsMainlineFrom(root, path);
  }

  pathIsMainlineFrom(node, path) {
    if (path === "") return true;
    const child = node.children[0];
    return child?.id === head(path) && pathIsMainlineFrom(child, tail(path));
  }

  findNode = (path) => findNodeFrom(this.root, path);

  findNodeFrom(node, path) {
    if (path === "") return node;
    const child = findChildbyId(node, head(path));
    return child ? findNodeFrom(child, tail(path)) : undefined;
  }

  updateAt(path, update) {
    const node = findNode(path);
    if (node) update(node);
    return node;
  }

  addNode(node, path) {
    const newPath = path + node.id;
    if (findNode(newPath)) return newPath;
    return updateAt(path, (n) => n.children.push(node)) ? newPath : undefined;
  }
}
