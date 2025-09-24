import { initSite } from 'src/lib/site/site';
import { client } from 'src/lib/api/client.gen';
import { wsConnect } from 'src/lib/socket/socket';
import { makeAppDependencies } from '../components/app/config';
import Cookies from 'js-cookie';
import type { ServerPayload } from './interface';

//todo : finish this mess(with let localstore.. for ceval hack): instanciate all object before router here -> providers , give value with app{...config}
//rewrite type properly
//disclamer : the change did nothing about multiple render -> resolution : its react18+, i should try on production

export const boot = async () => {
  initSite();
  setApiClient();
  wsConnect('/ws/taxi');
  const payload = getHtmlData();
  return makeAppDependencies(payload);
};

const setApiClient = () => {
  client.setConfig({
    baseUrl: 'http://localhost:5173',
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
