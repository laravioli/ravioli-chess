import { initSite } from 'src/lib/site/site';
import { client } from 'src/lib/api/client.gen';
import { wsConnect } from 'src/lib/socket/socket';
import { makeEvalStorage, makeLobbyStorage, type LocalStorage } from '../store/localstorage';
import Cookies from 'js-cookie';

//todo : finish this mess(with let localstore.. for ceval hack): instanciate all object before router here -> providers , give value with app{...config}
//rewrite type properly
//disclamer : the change did nothing about multiple render -> resolution : its react18+, i should try on production

export let localStorage: LocalStorage;

export async function boot() {
  initSite();
  initApiClient();
  wsConnect('/ws/taxi');
  const lobbyStorage = await makeLobbyStorage();
  const evalStorage = await makeEvalStorage();
  localStorage = { evalStorage, lobbyStorage };

  return { localStorage };
}

function initApiClient() {
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
}
