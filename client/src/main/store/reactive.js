//carefull : if i use setState in a react component, value wont be updated
const withNamespace = (store, namespace, property) => {
  if (typeof namespace === 'string') {
    return (newValue) =>
      store.setState((state) => ({
        [namespace]: { ...state[namespace], [property]: newValue },
      }));
  } else {
    return (newValue) => store.setState({ [property]: newValue });
  }
};

export const observable = (store, namespace) => (property) => {
  let value;
  const setter = withNamespace(store, namespace, property);

  return {
    get() {
      return value;
    },
    set(newValue) {
      if (typeof newValue === 'function') {
        throw new Error('observable property must be flagged as computed');
      }
      value = newValue;
      setter(newValue);
    },
  };
};

//note : no side effect function
export const computed = (store, namespace) => (property) => {
  let value;
  const setter = withNamespace(store, namespace, property);
  return {
    get() {
      return value;
    },
    set(newValue) {
      if (typeof newValue !== 'function') {
        throw new Error('computed property must be callable');
      } else if (value) {
        throw new Error('computed property cant be reassigned');
      }
      value = newValue;
      setter(newValue);
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
