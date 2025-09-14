import { Ceval } from 'src/lib/eval/ceval';
import { UserStore } from 'src/common/store/userstore';
import { AnalyseStore } from 'src/analyse/store/analyse';
import { EditorStore } from 'src/editor/store/editor';
import { PlayStore } from 'src/play/store/play';
import type { ServerConfig } from '../boot/config';

/* Global Store */

export interface GlobalStore {
  userStore: UserStore;
  ceval: Ceval;
}

export type PageStore = AnalyseStore | EditorStore | PlayStore;

let globalStore: GlobalStore | null = null;

export function makeGlobalStore(cfg: ServerConfig) {
  if (!globalStore) {
    globalStore = {
      userStore: new UserStore(cfg.user),
      ceval: new Ceval(),
    };
  }
  return globalStore;
}

/* Note on Transition */

/* Never perform an observable state change because of routing
   It doesn't play well with mobx/react router
   In this case the state should live in a PageStore
*/
