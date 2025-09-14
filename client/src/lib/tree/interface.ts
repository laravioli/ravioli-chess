import type { SquareName } from 'chessops';
import type { Ply, Uci, ClientEval } from '../eval/interface';
export type Path = string;

type Dests = Map<SquareName, SquareName[]>;

export interface Node {
  id: string;
  ply: Ply;
  uci?: Uci;
  fen: FEN;
  dests: Dests;
  check: boolean;
  ceval?: ClientEval;
  san?: string;
  outcome: boolean;
  children: Node[];
}

export interface Shape {
  orig: Key;
  dest?: Key;
}

export interface TPath {
  init(path: Path): Path;
  fromNodeList(nodes: Node[]): Path;
}

export interface TOps {
  last(nodeList: Node[]): Node;
  updateAll(root: Node, f: (node: Node) => void): void;
  mainlineNodeList(from: Node): Node[];
}

export type MaybeNode = Node | undefined;
