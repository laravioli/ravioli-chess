import 'vite/modulepreload-polyfill';
import 'src/main/components/css/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

//todo : get rid of zustand "action" -> full OO with my implementation
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
