//prb with register view ui

import { initSite } from 'src/lib/site/site';
import { client } from 'src/lib/api/client.gen';
import { wsConnect } from 'src/lib/socket/socket';

export async function boot() {
  initSite();
  client.setConfig({
    baseUrl: 'http://localhost:5173',
  });
  wsConnect('/ws/taxi');
}
