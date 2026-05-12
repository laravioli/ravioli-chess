type UUID = `${string}-${string}-${string}-${string}-${string}`;

export interface ServerPayload {
  user: User;
  page?: Page;
  data?: Data;
}

interface User {
  id: UUID;
  username: string;
  is_auth?: boolean;
}

export type Page = AnalyseConfig | EditorConfig | PlayConfig;

interface BasePage {
  orientation: Color;
  fen: FEN;
}

export type AnalyseConfig = BasePage & {};
export type EditorConfig = BasePage & {};
export type PlayConfig = BasePage & {};

export interface Data {
  positions?: PositionData[];
  unreadCount?: number;
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
