import '@mantine/core/styles.css';
import 'chessboard/styles.css';
import 'src/main/components/css/App.css';
import 'vite/modulepreload-polyfill';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { boot } from 'src/main/boot';
import App from './App.jsx';

boot();
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
