import { createContext } from 'react';

function loadData() {
  const dataScript = document.getElementById('page-init-data');
  const data = dataScript && JSON.parse(dataScript.innerHTML);
  dataScript?.remove();
  return data;
}

export const DataContext = createContext(loadData());
export const ModuleContext = createContext(null);
