import { Ceval } from 'src/lib/eval/ceval';
import { UserStore } from 'src/user/store/userstore';
import { AnalyseStore } from 'src/analyse/store/analyse';
import { EditorStore } from 'src/editor/store/editor';
import { PlayStore } from 'src/play/store/play';
import type { LocalEvalStorage } from 'src/lib/eval/localstorage';
import type { ServerConfig } from '../boot/interface';

/* Global Store */

interface GlobalStoreDependencies {
  userConfig: ServerConfig['user'];
  localEvalStorage: LocalEvalStorage;
}

export interface GlobalStore {
  userStore: UserStore;
  ceval: Ceval;
}

export function makeGlobalStore(dep: GlobalStoreDependencies) {
  const globalStore = {
    userStore: new UserStore(dep.userConfig),
    ceval: new Ceval(dep.localEvalStorage),
  };

  return globalStore;
}

/* Note on Transition */

/* Never perform a global observable state change because of routing (page)
It doesn't play well with mobx/react router
In this case the state should live in a PageStore
*/

/* Page Store */

export type PageStore = AnalyseStore | EditorStore | PlayStore;
