import { initSite } from 'src/lib/site/site';
import { rootStore } from '../store/rootstore';

export function boot() {
  initSite();
  const store = match(new URL(window.location).pathname);
  store?.onLoad();
}

const patterns = new Map([
  [/^\/(analysis)?$/, rootStore.analyseStore],
  [/^\/editor$/, rootStore.editorStore],
  [/^\/play$/, rootStore.playStore],
]);

export function match(path) {
  for (const [regex, value] of patterns) {
    if (regex.test(path)) {
      return value;
    }
  }
  return null;
}
