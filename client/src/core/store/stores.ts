import { UserStore } from '@/user/store/userstore';
import { AnalyseStore } from '@/analyse/store/analyse';
import { EditorStore } from '@/editor/store/editor';
import { PlayStore } from '@/play/store/play';
import { Ceval } from '@/lib/eval/ceval';
import { LobbySettings } from '@/lobby/localstorage';
import { QueryClient } from '@tanstack/react-query';
import { globalHandlers } from '@/common/socket';

import type { ServerPayload } from '@/core/boot/interface';

/* Global Store */

interface GlobalStoreDependencies {
  userConfig: ServerPayload['user'];
  queryClient: QueryClient;
}

export interface GlobalStore {
  userStore: UserStore;
  ceval: Ceval;
  lobbySettings: LobbySettings;
  socketReceive: (t: string, d: any) => void;
}

export const makeGlobalStore = (dep: GlobalStoreDependencies) => ({
  ceval: new Ceval(),
  lobbySettings: new LobbySettings(),
  userStore: new UserStore(dep.userConfig),
  socketReceive: globalHandlers(dep.queryClient),
});

/* Note on Transition */

/* Never perform a global observable state change because of routing (page)
It doesn't play well with mobx/react router
In this case the state should live in a PageStore
*/

/* Page Store */

export type PageStore = AnalyseStore | EditorStore | PlayStore;
