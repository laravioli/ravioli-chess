import { UserStore } from '@/user/store/userstore';
import { AnalyseStore } from '@/analyse/store/analyse';
import { EditorStore } from '@/editor/store/editor';
import { PlayStore } from '@/play/store/play';
import { Ceval } from '@/lib/eval/ceval';
import type { LocalEvalStorage } from '@/lib/eval/localstorage';

import type { ServerConfig } from '@/core/boot/interface';

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
