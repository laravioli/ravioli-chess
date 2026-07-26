import type { UserSuccess } from '@/lib/api';

type UUID = `${string}-${string}-${string}-${string}-${string}`;

export interface ServerPayload {
  page: PageData;
  user: UserData;
}

interface UserData {
  id?: UUID;
  username: string;
  is_auth?: boolean;
  unread_count?: number;
}

export interface PageData {
  config?: PageConfig;
  data?: Data;
}
export type PageConfig = AnalyseConfig | EditorConfig | PlayConfig;

export type AnalyseConfig = BaseConfig & {};
export type EditorConfig = BaseConfig & {};
export type PlayConfig = BaseConfig & {};

interface BaseConfig {
  orientation: Color;
  fen: FEN;
}

interface Data {
  positions?: PositionData[];
}

export interface PositionData {
  eco: string;
  name: string;
  fen: FEN;
}

export interface UserCacheEvent {
  onLogin: (user: UserSuccess) => Promise<void>;
  onLogout: () => number;
}
