export interface ServerPayload {
  cfg: ServerConfig;
  data: ServerData;
}

export interface ServerConfig {
  user: ServerUserOpts;
  orientation: Color;
  fen: FEN;
}

export interface ServerUserOpts {
  username: string;
  is_auth?: boolean;
}

export interface ServerData {
  positions: PositionData[];
}

export interface PositionData {
  eco: string;
  name: string;
  fen: FEN;
}
