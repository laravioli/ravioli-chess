//github.com/lichess-org/lila/blob/master/ui/%40types/lichess/tree.d.ts
import type { Ply, Uci, LocalEval, ClientEval, ServerEval } from '../eval/interface';
export type Path = string;

export interface NodeBase {
  id: string;
  ply: Ply;
  uci?: Uci;
  fen: FEN;
  dests?: string;
  drops?: string | null;
  check?: Key;
  threat?: LocalEval;
  ceval?: ClientEval;
  eval?: ServerEval;
  forceVariation?: boolean;
  shapes?: Shape[];
  san?: string;
  threefold?: boolean;
}
export interface NodeFromServer extends NodeBase {
  children?: Node[];
}

export interface Node extends NodeBase {
  children: Node[];
}

export interface Shape {
  orig: Key;
  dest?: Key;
}
