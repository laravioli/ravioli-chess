import type { ServerUserOpts } from 'src/common/store/interface';

export interface ServerConfig {
  user: ServerUserOpts;
  fen: FEN;
}
