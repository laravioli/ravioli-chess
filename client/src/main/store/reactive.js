const accessor = (store, namespace, property) => {
  const a =
    typeof namespace === 'string'
      ? {
          get: () => store.getState()[namespace].property,
          set: (newValue) =>
            store.setState((state) => ({
              [namespace]: { ...state[namespace], [property]: newValue },
            })),
        }
      : {
          get: () => store.geState()[property],
          set: (newValue) => store.setState({ [property]: newValue }),
        };
  return a;
};

export const observable = (store, namespace) => (property) => {
  const { get, set } = accessor(store, namespace, property);

  return {
    get,
    set(newValue) {
      if (typeof newValue === 'function') {
        throw new Error('observable property must be flagged as computed');
      }
      set(newValue);
    },
  };
};

//note : no side effect function
export const computed = (store, namespace) => (property) => {
  const { get, set } = accessor(store, namespace, property);
  return {
    get,
    set(newValue) {
      if (typeof newValue !== 'function') {
        throw new Error('computed property must be callable');
      } else if (get()) {
        throw new Error('computed property cant be reassigned');
      }
      set(newValue);
    },
  };
};

export const linkStateToStore = (store) => {
  return function (logic, ...stateDescriptors) {
    stateDescriptors.forEach((state) => {
      Object.keys(state)
        .filter((p) => p !== 'namespace')
        .forEach((property) => {
          const descriptor = state[property](store, state.namespace);
          Object.defineProperty(logic, property, descriptor(property));
        });
    });
  };
};
