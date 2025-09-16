import { initSite } from 'src/lib/site/site';
import { client } from 'src/lib/api/client.gen';
import { wsConnect } from 'src/lib/socket/socket';
import Cookies from 'js-cookie';

export async function boot() {
  initSite();
  initApiClient();
  wsConnect('/ws/taxi');
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
