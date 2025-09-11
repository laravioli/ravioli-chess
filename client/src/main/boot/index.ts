//prb with register view ui

import { initSite } from 'src/lib/site/site';
import { wsConnect } from 'src/lib/socket/socket';

export async function boot() {
  initSite();
  wsConnect('/ws/taxi');
}
