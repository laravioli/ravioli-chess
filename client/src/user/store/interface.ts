export interface UserServer {
  id: string;
  username: string;
  is_auth?: boolean;
}

export interface Credential {
  username: string;
  password: string;
  email?: string;
}
