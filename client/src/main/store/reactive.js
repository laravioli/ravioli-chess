export const observable = (store, module) => (property) => {
  const namespace = module.constructor.name.toLowerCase();
  let value = null;
  return {
    get() {
      return value;
    },
    set(newVal) {
      value = newVal;
      store.setState((state) => ({
        [namespace]: { ...state[namespace], [property]: newVal },
      }));
    },
  };
};

export const computed = (store, module) => (property) => {
  if (
    !Object.getOwnPropertyDescriptor(module.__proto__, property).get ||
    Object.getOwnPropertyDescriptor(module.__proto__, property).set
  )
    throw new Error('Computed property must be getter function');

  const namespace = module.constructor.name.toLowerCase();
  store.setState((state) => ({
    [namespace]: {
      ...state[namespace],
      [property]: () => module[property],
    },
  }));
};

export const makeModuleReactive = (store) => {
  return function (module, links) {
    Object.keys(links).forEach((property) => {
      const link = links[property];
      if (link.name === 'observable')
        Object.defineProperty(module, property, link(store, module)(property));
      else if (link.name === 'computed') link(store, module)(property);
    });
  };
};
