import { type MantineProviderProps } from '@mantine/core';
import { QueryClient } from '@tanstack/react-query';

import type { ServerPayload, ProvidedData, UserCacheEvent } from '@/core/boot/interface';
import { LobbySettings } from '@/lobby/localstorage';
import { UserStore } from '@/user/store/userstore';
import { Ceval } from '@/lib/eval/ceval';
import type { AnalyseStore } from '@/analyse/store/analyse';
import type { EditorStore } from '@/editor/store/editor';
import type { PlayStore } from '@/play/store/play';
import { CONFIG } from './config';
import { siteHandlers } from './socket';

export interface AppDeps {
  mantineConfig: MantineProviderProps;
  data: ProvidedData;
  queryClient: QueryClient;
  globalStore: GlobalStore;
}

export interface GlobalStore {
  userStore: UserStore;
  ceval: Ceval;
  lobbySettings: LobbySettings;
  socketReceive: (t: string, d: any) => void;
}

export type PageStore = AnalyseStore | EditorStore | PlayStore;

export const makeDeps = (
  payload: ServerPayload,
  queryClient: QueryClient,
  cacheEvent: UserCacheEvent,
): AppDeps => {
  return {
    mantineConfig: CONFIG.mantine,
    queryClient,
    globalStore: {
      userStore: new UserStore({ data: payload.user, cacheEvent }),
      ceval: new Ceval(),
      lobbySettings: new LobbySettings(),
      socketReceive: siteHandlers(queryClient),
    },
    data: { page: payload.page, data: payload.data },
  };
};
