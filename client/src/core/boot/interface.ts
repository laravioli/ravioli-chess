import type { UUID } from 'crypto';

export interface ServerPayload {
  cfg: ServerConfig;
  data: ServerData;
}

/* Config */

export interface ServerConfig {
  user: UserConfig;
  page: BasePageConfig;
}

/* User config */

export interface UserConfig {
  id: UUID;
  username: string;
  is_auth?: boolean;
}
/* Page config */

export interface BasePageConfig {
  orientation: Color;
  fen: FEN;
}

export interface AnalyseConfig extends BasePageConfig {}
export interface EditorConfig extends BasePageConfig {}
export interface PlayConfig extends BasePageConfig {}
export type PageConfig = AnalyseConfig | EditorConfig | PlayConfig;

/* Server data*/

export interface ServerData {
  positions: PositionData[];
}

export interface PositionData {
  eco: string;
  name: string;
  fen: FEN;
}

export interface ProvidedData {
  page: PageConfig;
  data: ServerData;
}
