import type { UserSuccess } from '@/lib/api';

type UUID = `${string}-${string}-${string}-${string}-${string}`;

export interface ServerPayload {
  user: UserData;
  page?: Page;
  data?: Data;
}

interface UserData {
  id: UUID;
  username: string;
  is_auth?: boolean;
  unread_count?: number;
}

export type Page = AnalyseConfig | EditorConfig | PlayConfig;

interface BasePage {
  orientation: Color;
  fen: FEN;
}

export type AnalyseConfig = BasePage & {};
export type EditorConfig = BasePage & {};
export type PlayConfig = BasePage & {};

interface Data {
  positions?: PositionData[];
}

export interface PositionData {
  eco: string;
  name: string;
  fen: FEN;
}

export interface ProvidedData {
  page?: Page;
  data?: Data;
}

export interface UserCacheEvent {
  onLogin: (user: UserSuccess) => Promise<void>;
  onLogout: () => number;
}
