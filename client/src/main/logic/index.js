import { Controller } from './main';
import { initSite } from 'src/lib/site/site';

function makeController() {
  const patterns = new Map([
    [/^\/(analysis|play\/computer)?$/, 'analysis'],
    [/^\/editor$/, 'editor'],
  ]);

  function match(path) {
    for (const [regex, value] of patterns) {
      if (regex.test(path)) {
        return value;
      }
    }
    return null;
  }

  const controller = new Controller(match(new URL(window.location).pathname));

  return {
    getModule: (path) => {
      const id = match(path);
      return controller.getModule(id);
    },
    setModule: (path, fen) => {
      const id = match(path);
      controller.setModule(id, { fen });
    },
  };
}

initSite();
export const controller = makeController();
