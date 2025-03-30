import 'vite/modulepreload-polyfill';
import 'src/assets/styles/index.css';
import { initSite } from './logic/modules/site/site.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

initSite();
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
