import { initSite } from 'src/lib/site/site';
import { client } from 'src/lib/api/client.gen';
import { wsConnect } from 'src/lib/socket/socket';
import { makeAppDependencies } from '../components/app/config';
import Cookies from 'js-cookie';
import type { ServerPayload } from './interface';

export const boot = async () => {
  initSite();
  setApiClient();
  wsConnect('/ws/taxi');
  const payload = getHtmlData();
  return makeAppDependencies(payload);
};

const setApiClient = () => {
  client.setConfig({
    baseUrl: import.meta.env.VITE_FRONTEND_DOMAIN,
    credentials: 'same-origin',
  });

  client.interceptors.request.use((request, options) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method!)) {
      request.headers.set('X-CSRFToken', Cookies.get('csrftoken'));
    }
    return request;
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
