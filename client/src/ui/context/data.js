import { createContext, useContext } from 'react';

function loadData() {
  const dataScript = document.getElementById('page-init-data');
  const data = dataScript && JSON.parse(dataScript.innerHTML);
  dataScript?.remove();
  return data;
}

const InitContext = createContext(loadData());

export const useInitData = () => useContext(InitContext);
