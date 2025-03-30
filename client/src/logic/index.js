import { mainStore } from 'src/stores';
import { Controller } from './modules/main/ctrl';

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

  const storeApi = (store) => ({
    get: store.getState,
    set: store.setState,
    subscribe: store.subscribe,
  });

  const store = storeApi(mainStore);
  const controller = new Controller(
    match(new URL(window.location).pathname),
    store
  );

  return {
    getModule: (path) => {
      const id = match(path);
      return controller.getModule(id);
    },
    setModule: (path, fen) => {
      const id = match(path);
      controller.setModule(id, { fen, store });
    },
  };
}

export const controller = makeController();
