import type { UUID } from 'crypto';

export interface UserOpts {
  id: UUID;
  username: string;
  is_auth?: boolean;
}

export interface Credential {
  username: string;
  password: string;
  email?: string;
}
