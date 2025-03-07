import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.BASE,
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve('src'),
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
    server: {
      origin: 'http://localhost:5173',
      headers: {
        'cross-origin-opener-policy': 'same-origin',
        'cross-origin-embedder-policy': 'credentialless',
      },
      proxy: {
        [`^${env.BASE}$`]: {
          target: env.BACKEND_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(new RegExp(`^${env.BASE}`), ''),
        },
      },
    },
    build: {
      manifest: 'manifest.json',
      rollupOptions: {
        input: 'src/main.jsx',
      },
    },
  };
});
