// @ts-ignore
import 'vite/modulepreload-polyfill';
import 'src/common/css/chessground.base.css';
import 'src/common/css/chessground.brown.css';
import 'src/common/css/chessground.cburnett.css';
import '@mantine/notifications/styles.css';
import 'src/main/css/App.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { boot } from 'src/main/boot';
import App from './App';

boot()
  .then(() =>
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
  .catch(err => console.log(err));
