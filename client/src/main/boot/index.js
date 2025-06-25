import { initSite } from 'src/lib/site/site';
import { rootStore } from '../store';

export async function boot() {
  initSite();
  await rootStore.userStore.getSession();
}
