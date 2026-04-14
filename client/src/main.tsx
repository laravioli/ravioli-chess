// @ts-ignore
import 'vite/modulepreload-polyfill';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/core/css/index.css';
import { boot } from '@/core/boot';
import App from '@/core/app/App';

boot()
  .then((config) =>
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App {...config} />
      </StrictMode>,
    ),
  )
  .catch((err) => console.log(err));
