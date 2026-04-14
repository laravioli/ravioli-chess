import { initGlobals } from '@/lib/site';
import { client as clientAPI } from '@/lib/api/client.gen';

import { makeAppDependencies } from '@/core/app/config';
import type { ServerPayload } from './interface';

export const boot = async () => {
  initGlobals();
  clientAPI.setConfig({
    baseUrl: import.meta.env.VITE_FRONTEND_DOMAIN,
    credentials: 'same-origin',
  });
  const dataScript = document.getElementById('page-init-data');
  const payload: ServerPayload | undefined = dataScript && JSON.parse(dataScript.innerHTML);
  dataScript?.remove();

  if (!payload) {
    throw new Error('missing intial data from server');
  }
  return makeAppDependencies(payload);
};
