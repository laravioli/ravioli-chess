import { initSite } from '@/lib/site/site';
import { client } from '@/lib/api/client.gen';

import { makeAppDependencies } from '@/core/components/app/config';
import type { ServerPayload } from './interface';

export const boot = async () => {
  initSite();
  setApiClient();
  const payload = getHtmlData();
  return makeAppDependencies(payload);
};

const setApiClient = () => {
  client.setConfig({
    baseUrl: import.meta.env.VITE_FRONTEND_DOMAIN,
    credentials: 'same-origin',
  });
};

const getHtmlData = () => {
  const dataScript = document.getElementById('page-init-data');
  const payload: ServerPayload | undefined = dataScript && JSON.parse(dataScript.innerHTML);
  dataScript?.remove();

  if (!payload) {
    throw new Error('missing intial data from server');
  }
  return payload;
};
