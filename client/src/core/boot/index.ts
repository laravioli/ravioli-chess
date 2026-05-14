import { initGlobals } from '@/lib/site';
import { client as clientAPI } from '@/lib/api/client.gen';
import { QueryClient } from '@tanstack/react-query';

import { CONFIG } from '@/core/app/config';
import type { ServerPayload } from './interface';
import { hydrate } from './hydrate';
import { makeDeps } from '@/core/app/deps';

export const boot = async () => {
  const dataScript = document.getElementById('page-init-data');
  const payload: ServerPayload | undefined = dataScript && JSON.parse(dataScript.innerHTML);
  dataScript?.remove();

  if (!payload) {
    throw new Error('missing intial data from server');
  }

  initGlobals();
  clientAPI.setConfig({
    baseUrl: import.meta.env.VITE_FRONTEND_DOMAIN,
    credentials: 'same-origin',
  });
  const queryClient = new QueryClient(CONFIG.queryClient);
  const cacheController = hydrate(payload.data, queryClient);
  return makeDeps(payload, queryClient, cacheController);
};
